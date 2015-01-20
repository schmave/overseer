(ns clojure-getting-started.db
  (:require [carica.core :as c]
            [cemerick.url :as url]
            [com.ashafa.clutch :as couch]
            ))
(def db (assoc (url/url (c/config :db :url)
                        (c/config :db :name))
          :username (c/config :db :user)
          :password (c/config :db :password)))
#_(def db (cemerick.url/url "http://127.0.0.1:5984" (c/config :db :name)))

(def design-doc
  {"_id" "_design/view"
   "views" {"students" {"map" "function(doc) {
                                 if (doc.type === \"student\") {
                                   emit(doc._id, doc);
                                 }
                               }"}
            "student-swipes" {"map"
                              "function(doc) {
                                if (doc.type == \"student\") {
                                  map([doc._id, 0], doc);
                                } else if (doc.type == \"swipe\") {
                                  map([doc.post, 1], doc);
                                }
                              }"}
            "swipes" {"map"
                      "function(doc) {
                         if (doc.type == \"swipe\") {
                           emit(doc.student_id, doc);
                         }
                       }"}
            "years" {"map"
                     "function(doc) {
                         if (doc.type == \"year\") {
                           emit(doc.name, doc);
                         }
                       }"}
            "overrides" {"map"
                         "function(doc) {
                            if (doc.type == \"override\") {
                              emit(doc.student_id, doc);
                            }
                          }"}
            }
   "language" "javascript"})

(defn make-db [] (couch/put-document db design-doc))
