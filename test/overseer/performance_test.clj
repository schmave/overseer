(ns overseer.performance-test
  (:require [clojure.test :refer :all]
            [clj-time.format :as f]
            [clojure.java.shell :as sh]
            [goat.core :as goat]
            [clj-time.local :as l]
            [clj-time.core :as t]
            [clj-time.coerce :as c]
            [clojure.tools.trace :as trace]
            [overseer.db :as d]
            [overseer.attendance :as att]
            [overseer.helpers :as h]
            [overseer.helpers-test :as testhelpers]
            [overseer.dates :as dates]
            [overseer.database.connection :refer [pgdb]]
            [overseer.migrations :as migrations]
            [overseer.db :as db]
            [overseer.database :as data]
            [clojure.java.jdbc :as jdbc]
            [clojure.pprint :refer :all]
            ))

(defn migrate-test-db []
  (jdbc/execute! @pgdb [(str "DELETE FROM schema_migrations where 1=1; ")])
  (migrations/migrate-db @pgdb)
  (jdbc/execute! @pgdb [(str "DELETE FROM users where 1=1; ")])
  (db/init-users))

(defn collect-timing []
  (goat/clear-perf-data!)
  (let [x (att/get-student-with-att 1)
        stu (first x)
        perf (goat/get-fperf-data)]
    (testing "days all came back" (is (= 199 (count (:days stu)))))
    (:total-time (get perf 'overseer.db/get-student-page))))

(deftest ^:performance massive-timing
  (sh/sh "make" "load-massive-dump")
  (migrate-test-db)
  (data/make-year (str (t/date-time 2014 6)) (str (t/plus (t/now) (t/days 9))))
  (let [students (data/get-students)]
    (doall (map #(data/add-student-to-class (:_id %) 1)
                students)))
  (let [students (time (att/get-student-list))]
    (testing "found all students" (is (= 80 (count students)))))

  (goat/reset-instrumentation!)
  (goat/instrument-functions! 'overseer.attendance)
  (goat/instrument-functions! 'overseer.db)
  (goat/instrument-functions! 'overseer.database)

  #_(goat/get-top-fperf 15 )

  (let [runs (map (fn [x] (collect-timing)) (range 10))
        t (trace/trace "runs " runs)
        average-time (int (/ (apply + (trace/trace "runs" runs)) 10))]
    (testing "its fast too"
      (is (> 250 average-time))))


  )

