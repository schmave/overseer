(ns overseer.reports
  (:require [compojure.core :refer [defroutes GET PUT POST DELETE ANY]]
            [compojure.coercions :refer [as-int]]
            [ring.util.response :as resp]
            [clojure.tools.trace :as trace]
            [overseer.db :as db]
            [overseer.database :as data]
            [overseer.dates :as dates]
            [overseer.roles :as roles]
            [cemerick.friend :as friend]))

(defn year-resp []
  (let [years (data/get-years)]
    (resp/response {:years (map :name years)
                    :current_year (dates/get-current-year-string years)})))

(defroutes report-routes
  (GET "/reports/years" []
       (friend/authorize #{roles/user} (year-resp)))

  (DELETE "/reports/years/:year" [year]
          (friend/authorize #{roles/admin}
                            (data/delete-year year)
                            (year-resp)))
  (POST "/reports/years" [from_date to_date]
        (friend/authorize #{roles/admin}
                          (let [made? (data/make-year from_date to_date)]
                            (resp/response {:made made?}))))
  (GET "/reports/:year" [year]
       (friend/authorize #{roles/admin}
                         (resp/response (db/get-report year))))
  (GET "/reports/:year/:class" [year class]
       (friend/authorize #{roles/admin}
                         (resp/response (db/get-report year class))))

  )

