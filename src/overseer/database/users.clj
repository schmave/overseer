(ns overseer.database.users
  (:import [java.sql PreparedStatement]
           [java.util Date Calendar TimeZone])
  (:require [clojure.java.jdbc :as jdbc]
            [overseer.helpers :as logh]
            [overseer.database.connection :refer [pgdb]]

            (cemerick.friend [workflows :as workflows]
                             [credentials :as creds])

            [environ.core :refer [env]]
            [overseer.roles :as roles]

            [overseer.migrations :as migrations]
            ;; [overseer.queries.demo :as demo]
            [overseer.queries.phillyfreeschool :as pfs]
            [yesql.core :refer [defqueries]]
            [overseer.db :as db]

            ))

(defqueries "overseer/base.sql" )

;; (insert-email "test@test.com")
(logh/deftrace insert-email [email]
  (jdbc/insert! @pgdb :emails {:email email}))

;; (get-user "admin2")
(defn get-user [username]
  (if-let [u (first (get-user-y { :username username} {:connection @pgdb}))]
    (assoc u :roles (read-string (:roles u)))))

;;(get-users)
(defn get-users []
  (->> (jdbc/query @pgdb ["select * from users;"])
       (map #(dissoc % :password))))

;;(set-user-schema "super" "TEST")
;;(get-user "super")
(defn set-user-schema [username schema]
  (jdbc/update! @pgdb :users {:schema_name schema} ["username=?" username]))

(defn make-user
  ([username password roles]
   (make-user username password roles db/*school-schema*))
  ([username password roles schema]
   (if-not (get-user username)
     (jdbc/insert! @pgdb "users"
                   {:username username
                    :password (creds/hash-bcrypt password)
                    :schema_name schema
                    :roles  (str (conj roles roles/user))}))))

(defn init-users []
  (make-user "admin" (env :admin) #{roles/admin roles/user} "phillyfreeschool")
  (make-user "super" (env :admin) #{roles/admin roles/user roles/super}  "phillyfreeschool")
  (make-user "user" (env :userpass) #{roles/user} "phillyfreeschool")
  (make-user "admin2" (env :admin) #{roles/admin roles/user} "demo")
  (make-user "demo" (env :userpass) #{roles/admin roles/user} "demo")
  )

(defn drop-all-tables []
  (jdbc/execute! @pgdb [(str "DROP TABLE IF EXISTS schema_migrations;"
                             "DROP TABLE IF EXISTS users; "
                             "DROP TABLE IF EXISTS emails; "
                             "DROP TABLE IF EXISTS session_store;"
                             "DROP SCHEMA IF EXISTS phillyfreeschool CASCADE;"
                             "DROP SCHEMA IF EXISTS overseer CASCADE;"
                             "DROP SCHEMA IF EXISTS demo CASCADE;")]))

;;(reset-db)
(defn reset-db []
  (drop-all-tables)
  (migrations/migrate-db @pgdb)
  (init-users))
