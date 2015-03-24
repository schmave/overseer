(defproject clojure-getting-started "1.0.0-SNAPSHOT"
  :description "Demo Clojure web app"
  :url "http://clojure-getting-started.herokuapp.com"
  :license {:name "Eclipse Public License v1.0"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [compojure "1.1.8"]
                 [ring/ring-jetty-adapter "1.2.2"]
                 [org.clojure/tools.nrepl "0.2.5"]
                 [org.clojure/data.json "0.2.5"]
                 [com.cemerick/friend "0.2.1"]
                 [environ "1.0.0"]
                 [ring/ring-json "0.3.1"]
                 [sonian/carica "1.1.0" :exclusions [[cheshire]]]
                 [clj-time "0.8.0"]
                 [heroku-database-url-to-jdbc "0.2.2"]
                 [org.clojure/java.jdbc "0.3.2"]
                 [postgresql "9.1-901.jdbc4"]
                 [com.ashafa/clutch "0.4.0"]]
  :min-lein-version "2.0.0"
  :main clojure-getting-started.web/-main
  :plugins [[cider/cider-nrepl "0.8.1"]
            [lein-ring "0.7.0"]
            [environ/environ.lein "0.2.1"]]
  :hooks [environ.leiningen.hooks]
  :uberjar-name "clojure-getting-started-standalone.jar"
  :profiles {:production {:env {:production true}}
             :uberjar {:aot :all}})
