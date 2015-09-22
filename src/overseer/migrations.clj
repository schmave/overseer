(ns overseer.migrations
  (:require [environ.core :refer [env]]
            [migratus.core :as migratus]))

(comment "
 -- broken till otherwise noted
  CREATE VIEW roundedswipes AS
  SELECT
     _id
     , ((CASE WHEN (EXTRACT(HOURS FROM s.in_time AT TIME ZONE 'America/New_York') < 9
                  AND EXTRACT(HOURS FROM s.in_time AT TIME ZONE 'America/New_York') < 16)
              THEN (date_trunc('day', s.in_time AT TIME ZONE 'America/New_York') + interval '9 hours')
              WHEN (EXTRACT(HOURS FROM s.in_time AT TIME ZONE 'America/New_York') >= 16)
              THEN (date_trunc('day', s.in_time AT TIME ZONE 'America/New_York') + interval '16 hours')
          ELSE s.in_time END)) as in_time
     , ((CASE WHEN (EXTRACT(HOURS FROM s.out_time AT TIME ZONE 'America/New_York') >= 16)
              THEN (date_trunc('day', s.out_time AT TIME ZONE 'America/New_York') + interval '16 hours') 
              WHEN (EXTRACT(HOURS FROM s.out_time AT TIME ZONE 'America/New_York') < 9)
              THEN (date_trunc('day', s.out_time AT TIME ZONE 'America/New_York') + interval '9 hours')
          ELSE s.out_time END)) AS out_time
     , student_id
   FROM swipes s;
")

(def initialize-prod-database
  "
  create table students(
    _id bigserial primary key,
    name varchar(255),
    inserted_date timestamp default now(),
    olderdate date,
    show_as_absent date,
    archived BOOLEAN NOT NULL DEFAULT FALSE
  );

  create table swipes(
    _id bigserial primary key,
    student_id bigserial,
    in_time timestamp  with time zone,
    inserted_date timestamp default now(),
    out_time timestamp with time zone
  );

   create table overrides(
    _id bigserial primary key,
    student_id bigserial,
    inserted_date timestamp default now(),
    date date
  );
  create table excuses(
    _id bigserial primary key,
    student_id bigserial,
    inserted_date timestamp default now(),
    date date
  );

  CREATE TABLE session_store (
    session_id VARCHAR(36) NOT NULL PRIMARY KEY,
    idle_timeout BIGINT,
    absolute_timeout BIGINT,
    value BYTEA
  );

  CREATE OR REPLACE VIEW roundedswipes AS
  SELECT _id, in_time, out_time, student_id FROM swipes;

  CREATE TABLE classes(
       _id BIGSERIAL PRIMARY KEY,
       name VARCHAR(255),
       inserted_date timestamp default now(),
       active BOOLEAN NOT NULL DEFAULT FALSE
  );

  CREATE TABLE classes_X_students(
       class_id BIGINT NOT NULL REFERENCES classes(_id),
       student_id BIGINT NOT NULL REFERENCES students(_id)
  );

  create table years(
    _id bigserial primary key,
    from_date timestamp  with time zone,
    to_date timestamp  with time zone,
    inserted_date timestamp default now(),
    name varchar(255)
  );

CREATE OR REPLACE FUNCTION school_days(year_name TEXT, class_id BIGINT)
  RETURNS TABLE (days date, student_id BIGINT, archived boolean, olderdate date) AS
$func$

SELECT a.days, s._id student_id, s.archived, s.olderdate
FROM (SELECT DISTINCT days2.days
    FROM (SELECT
            (CASE WHEN date(s.in_time AT TIME ZONE 'America/New_York')  IS NULL
            THEN date(s.out_time AT TIME ZONE 'America/New_York')
            ELSE date(s.in_time AT TIME ZONE 'America/New_York') END) AS days
         FROM roundedswipes s
         INNER JOIN years y
            ON ((s.out_time BETWEEN y.from_date AND y.to_date)
            OR (s.in_time BETWEEN y.from_date AND y.to_date))
         JOIN classes c ON (c.active = true)
         JOIN classes_X_students cXs ON (cXs.class_id = c._id
                                         AND s.student_id = cXs.student_id)
         WHERE y.name = $1) days2
         ORDER BY days2.days) AS a
JOIN classes_X_students cXs ON (1=1)
JOIN students s ON (s._id = cXs.student_id)
WHERE cXs.class_id = $2
$func$
LANGUAGE sql;
  ")


(def mconfig
  {:store :database
   :db  (env :database-url)
   })

;; (migratus/create mconfig "UpdateSchoolDays")
;;(migratus/migrate mconfig)
;; (migratus/rollback mconfig)
;; (migratus/down mconfig 20150908103000 20150909070853 20150913085152)

