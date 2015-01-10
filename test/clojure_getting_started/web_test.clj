(ns clojure-getting-started.web-test
  (:require [clojure.test :refer :all]
            [clj-time.format :as f]
            [clj-time.local :as l]
            [clj-time.core :as t]
            [clj-time.coerce :as c]
            [clojure.tools.trace :as trace]
            [clojure-getting-started.database :as db]
            [clojure-getting-started.attendance :as att]
            [clojure-getting-started.dates :as dates]
            ))

(comment
  (run-tests 'clojure-getting-started.web-test)  
  )  

(def basetime (t/date-time 2014 10 14 14 9 27 246)) 

(defn get-att [id]
  (let [year (dates/get-current-year-string (db/get-years))
        school-days (att/get-school-days year)]
    (att/get-attendance school-days year id)))

(deftest date-stuff
  (= (dates/make-date-string "2014-12-28T14:32:12.509Z")
     "12-28-2014")
  ;; this will fail after DST *shakes fist*
  (is (= (dates/make-time-string "2014-12-28T14:32:12.509Z")
         "09:32:12")))

(defn add-swipes [sid]
  ;; 14 hours in UTC is 9 Am here
  (db/swipe-in sid basetime)
  (db/swipe-out sid (t/plus basetime (t/hours 6)))

  ;; good tomorrow
  
  (db/swipe-in sid (t/plus basetime (t/days 1)))
  (db/swipe-out sid (t/plus basetime (t/days 1) (t/hours 6)))

  ;; short the next
  
  (db/swipe-in sid (t/plus basetime (t/days 2)))
  (db/swipe-out sid (t/plus basetime (t/days 2) (t/hours 4)))


  ;; two short the next but long enough
  
  (db/swipe-in sid (t/plus basetime (t/days 3)))
  (db/swipe-out sid (t/plus basetime (t/days 3) (t/hours 4)))
  (db/swipe-in sid (t/plus basetime (t/days 3) (t/hours 5)))
  (db/swipe-out sid (t/plus basetime (t/days 3) (t/hours 7)))

  ;; short the next - 10-18-2014
  
  (db/swipe-in sid (t/plus basetime (t/days 4)))
  (db/swipe-out sid (t/plus basetime (t/days 4) (t/hours 4)))
  )

(deftest make-swipe-out
  (testing "sanitize"
    (testing "sanitize swipe out no times"
      (let [result (db/sanitize-out (db/make-swipe 1))]
        (is (= (-> result :in_time) nil))
        (is (= (-> result :out_time) nil)))) 
    (testing "sanitize swipe out with valid times does nothing"
      (let [passed (assoc (db/make-swipe 1)
                     :in_time (str basetime)
                     :out_time (str (t/plus basetime (t/minutes 5))))
            result (db/sanitize-out passed)]
        (is (= passed result)))) 
    (testing "sanitize swipe out with newer out time forces same out as in"
      (let [passed (assoc (db/make-swipe 1)
                     :in_time (str basetime)
                     :out_time (str (t/minus basetime (t/minutes 5))))
            result (db/sanitize-out passed)]
        (is (= (:in_time passed) (:in_time result)))
        (is (= (:in_time passed) (:out_time result)))
        ))
    (testing "sanitize swipe out with out in wrong day forces out to be same day"
      (let [passed (assoc (db/make-swipe 1)
                     :in_time (str basetime)
                     :out_time (str (t/plus basetime (t/minutes 5) (t/days 1))))
            result (db/sanitize-out passed)]
        (is (= (:in_time passed) (:in_time result)))
        (is (= (:in_time passed) (:out_time result)))))
    )   
  
  )

(deftest swipe-attendence-override-test
  (db/sample-db)  
  (let [sid (-> "test" db/make-student :_id)]
    (db/swipe-in sid basetime)
    (db/swipe-out sid (t/plus basetime (t/hours 4)))
    (db/override-date sid "2014-10-14")
    (let [att (get-att sid)]
      (testing "Total Valid Day Count"
        (is (= (:total_days att)
               1)))
      (testing "Total Abs Count"
        (is (= (:total_abs att)
               0)))
      (testing "Override"
        (is (= (-> att :days first :override)
               true)))
      )) 
  )

(deftest swipe-attendence-test
  (do (db/sample-db)  
      (let [sid (-> "test" db/make-student :_id)
            sid2 (-> "test2" db/make-student :_id)]
        ;; good today
        (add-swipes sid)
        (db/override-date sid "2014-10-18")

        (testing "School year is list of days with swipes"
          (is (= (att/get-school-days "2014-06-01 2015-06-01")
                 (list "2014-10-14" "2014-10-15" "2014-10-16" "2014-10-17" "2014-10-18"))))
        (let [att (get-att sid)
              att2 (get-att sid2)]
          (testing "Total Valid Day Count"
            (is (= (:total_days att)
                   4)))
          (testing "Total Abs Count"
            (is (= (:total_abs att)
                   1)))
          (testing "Total Overrides"
            (is (= (:total_overrides att)
                   1)))
          (testing "Days sorted correctly"
            (is (= (-> att :days first :day)
                   "2014-10-18")))
          (testing "Nice time shown correctly"
            (is (= (-> att :days first :swipes first :nice_in_time)
                   ;; shown as hour 10 because that was DST forward +1
                   "10:09:27")))
          (testing "Total Abs Count For Student 2 Should equal number of total days for student 1"
            (is (= (:total_abs att2)
                   5)))
          )
        (testing "an older date string shows no attendance in that time"
          (let [att (att/get-attendance [] "06-01-2013-05-01-2014" sid)]
            (testing "Total Valid Day Count"
              (is (= (:total_days att)
                     0)))
            (testing "Total Abs Count"
              (is (= (:total_abs att)
                     0)))
            (testing "Total Overrides"
              (is (= (:total_overrides att)
                     0)))
            )))) 
  )


(deftest swipe-attendence-shows-only-when-in
  (do (db/sample-db)  
      (let [sid (-> "test" db/make-student :_id)]
        ;; good today
        ;;(let [basetime (t/date-time 2014 10 14 14 9 27 246)])
        (db/swipe-in sid basetime)
        (let [att (get-att sid)]
          (testing "Total Valid Day Count"
            (is (= (-> att :days first :day)
                   "2014-10-14")))
          (testing "Last Swipe was an 'in'"
            (is (= (-> att :last_swipe_type)
                   "in")))
          ))) 
  )

(comment {:total_days 2, :total_abs 1, :days ({:valid true, :day "10-14-2014", :total_mins 360, :swipes [{:nice_out_time "03:09:27", :nice_in_time "09:09:27", :interval 360, :_id "d152dcfff8282f3ffa590d8f9a00fb4e", :_rev "2-0c6538f07be3e825f457a6c77c086ca4", :out_time "2014-10-14T15:09:27.246Z", :type "swipe", :student_id "d152dcfff8282f3ffa590d8f9a00f951", :in_time "2014-10-14T09:09:27.246Z"}]} {:valid true, :day "10-15-2014", :total_mins 360, :swipes [{:nice_out_time "03:09:27", :nice_in_time "09:09:27", :interval 360, :_id "d152dcfff8282f3ffa590d8f9a010780", :_rev "2-9b40bea0ef22868cadba5fb23bc26d80", :out_time "2014-10-15T15:09:27.246Z", :type "swipe", :student_id "d152dcfff8282f3ffa590d8f9a00f951", :in_time "2014-10-15T09:09:27.246Z"}]} {:valid false, :day "10-16-2014", :total_mins 240, :swipes [{:nice_out_time "01:09:27", :nice_in_time "09:09:27", :interval 240, :_id "d152dcfff8282f3ffa590d8f9a011101", :_rev "2-b438d5cb24cb92e5a3b411df19aea4c0", :out_time "2014-10-16T13:09:27.246Z", :type "swipe", :student_id "d152dcfff8282f3ffa590d8f9a00f951", :in_time "2014-10-16T09:09:27.246Z"}]})}) 
