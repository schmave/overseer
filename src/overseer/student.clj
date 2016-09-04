(ns overseer.student
  (:require [compojure.core :refer [defroutes GET PUT POST DELETE ANY]]
            [compojure.coercions :refer [as-int]]
            [ring.util.response :as resp]
            [clojure.tools.trace :as trace]
            [overseer.db :as db]
            [overseer.database :as data]
            [overseer.dates :as dates]
            [overseer.attendance :as att]
            [overseer.roles :as roles]
            [cemerick.friend :as friend]))

(defn student-attendence [student-id]
  (first (att/get-student-with-att student-id)))

(defn student-page-response [student-id]
  (resp/response {:student (student-attendence student-id)}))

(defn show-archived? [] true)

(defn get-student-list []
  (att/get-student-list (show-archived?)))

(defroutes student-routes
  (GET "/allstudents" req
    (friend/authorize #{roles/admin}
                      (resp/response (data/get-students))))
  (GET "/students" req
       (friend/authorize #{roles/user}
                         (resp/response {:today (dates/today-string)
                                         :students (get-student-list)})))

  (GET "/students/:id" [id :<< as-int]
       (friend/authorize #{roles/user} (student-page-response id)))

  (POST "/students" [name email]
        (friend/authorize #{roles/admin}
                          (resp/response {:made (data/make-student-starting-today name email)
                                          :students (get-student-list)})))

  (PUT "/user" [name password]
    (friend/authorize #{roles/super}
                     (db/make-user name password #{roles/admin})))
  (GET "/user" []
    (friend/authorize #{roles/super}
                      (resp/response {:users (db/get-users)})))

  (PUT "/students/:id" [id :<< as-int name start_date email]
       (friend/authorize #{roles/admin}
                         (data/edit-student id name start_date email))
       (student-page-response id))

  (POST "/students/:id/togglehours" [id :<< as-int]
        (friend/authorize #{roles/admin}
                          (do (data/toggle-student-older id)
                              (student-page-response id))))

  (POST "/students/:id/absent" [id :<< as-int]
        (friend/authorize #{roles/user}
                          (do (data/toggle-student-absent id)
                              (student-page-response id))))

  (POST "/students/:id/excuse" [id :<< as-int day]
        (friend/authorize #{roles/admin}
                          (data/excuse-date id day))
        (student-page-response id))

  (POST "/students/:id/override" [id :<< as-int day]
        (friend/authorize #{roles/admin}
                          (data/override-date id day))
        (student-page-response id))

  (POST "/students/:id/swipe/delete" [id :<< as-int swipe]
        (friend/authorize #{roles/admin}
                          (data/delete-swipe swipe)
                          (student-page-response id)))
  (POST "/students/:id/swipe" [id :<< as-int direction  missing]
        (friend/authorize #{roles/user}
                          (if (= direction "in")
                            (do (when missing (data/swipe-out id missing))
                                (data/swipe-in id))
                            (do (when missing (data/swipe-in id missing))
                                (data/swipe-out id))))
        (resp/response {:students (get-student-list)})))
