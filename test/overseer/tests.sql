select * from students;


SELECT 
  schooldays.student_id
  , to_char(s.in_time at time zone 'America/New_York', 'HH:MI:SS') as nice_in_time
  , to_char(s.out_time at time zone 'America/New_York', 'HH:MI:SS') as nice_out_time
  , s.out_time 
  , s.in_time
  , extract(EPOCH FROM (s.out_time - s.in_time)::INTERVAL)/60 as intervalmin
  , o._id has_override
  , e._id has_excuse
  , schooldays.olderdate
  , (CASE WHEN schooldays.olderdate IS NULL 
               OR schooldays.olderdate > schooldays.days
               THEN 300 ELSE 330 END) as requiredmin
  , schooldays.days AS day
    FROM ( 
      SELECT a.days, students._id student_id, students.olderdate FROM (SELECT DISTINCT days2.days
      FROM (SELECT
                (CASE WHEN date(s.in_time at time zone 'America/New_York')  IS NULL 
                THEN date(s.out_time at time zone 'America/New_York')
                ELSE date(s.in_time at time zone 'America/New_York') END) as days
            FROM swipes s
            INNER JOIN years y 
            ON ((s.out_time BETWEEN y.from_date AND y.to_date)
            OR (s.in_time BETWEEN y.from_date AND y.to_date))
            WHERE y.name= '2014-06-01 2015-06-01') days2
      ORDER BY days2.days) as a
      JOIN students on (1=1)
      where students._id = 1
    ) as schooldays
    LEFT JOIN swipes s
      ON (
       ((schooldays.days = date(s.in_time at time zone 'America/New_York'))
       OR
        (schooldays.days = date(s.out_time at time zone 'America/New_York')))
        AND schooldays.student_id = s.student_id) 
    LEFT JOIN overrides o 
      ON (schooldays.days = o.date AND o.student_id = schooldays.student_id)
    LEFT JOIN excuses e 
      ON (schooldays.days = e.date AND e.student_id = schooldays.student_id)
    where schooldays.days is not null
    and schooldays.student_id = 1;



-- (get-student-page 1 "2014-06-01 2015-06-01")

-- '2014-07-23 2015-06-17'
-- WHERE y.name=  '2014-06-01 2015-06-01') days2
-- where schooldays.student_id = 11

-- alter table students alter column olderdate type date using olderdate::date;
-- update students set olderdate = '2015-03-18' where _id = 10;

-- School Migration 

--      Step 1 - olderdate to date
-- alter table students alter column olderdate type date using olderdate::date;
-- select * from students ;

--      Step 2 - year dates

-- select * from years ;

-- alter table years 
-- alter column from_date type timestamp with time zone
-- using from_date::timestamp with time zone ;

-- alter table years 
-- alter column to_date type timestamp with time zone
-- using to_date::timestamp with time zone ;

-- select column_name, data_type, character_maximum_length
-- from INFORMATION_SCHEMA.COLUMNS where table_name = 'years';

--       Step 3 - Swipes

-- select column_name, data_type, character_maximum_length
-- from INFORMATION_SCHEMA.COLUMNS where table_name = 'swipes';

-- alter table swipes 
-- alter column out_time type timestamp with time zone
-- using out_time::timestamp with time zone ;

-- alter table swipes 
-- alter column in_time type timestamp with time zone
-- using in_time::timestamp with time zone ;


-- select * from swipes where _id = 515 ;

--       Step 4 - Overrides

-- select column_name, data_type, character_maximum_length
-- from INFORMATION_SCHEMA.COLUMNS where table_name = 'overrides';

-- alter table overrides 
-- alter column date type date
-- using date::date; 

-- select * from overrides;

--       Step 5 - Excuses

-- select column_name, data_type, character_maximum_length
-- from INFORMATION_SCHEMA.COLUMNS where table_name = 'excuses';

-- alter table excuses 
-- alter column date type date
-- using date::date; 

-- select * from excuses;


-- Step 6 - Absent Date
-- alter table students add column show_as_absent date;





-- Aliasing names
-- update overseer.students set name='Arathilion Boom' where _id=1;
-- update overseer.students set name='John Darran' where _id=2;
-- update overseer.students set name='Jol Carlstein' where _id=3;
-- update overseer.students set name='Galak Daklan' where _id=4;
-- update overseer.students set name='Brodie Ananillka' where _id=5;
-- update overseer.students set name='Aria Xergo' where _id=6;
-- update overseer.students set name='Edea Rostoni' where _id=7;
-- update overseer.students set name='Elayne Janin' where _id=8;
-- update overseer.students set name='Klai Berus' where _id=9;
-- update overseer.students set name='Boc Kodd' where _id=10;
-- update overseer.students set name='Aztin Tess' where _id=11;
-- update overseer.students set name='Burin Cruz' where _id=12;
-- update overseer.students set name='Rine Grainer' where _id=13;
-- update overseer.students set name='Garr Salis' where _id=14;
-- update overseer.students set name='Nikana Kwai' where _id=15;
-- update overseer.students set name='Herub Arcturus' where  _id=16;
-- update overseer.students set name='Proddo Scutu' where _id=17;
-- update overseer.students set name='Galven Twilight' where _id=18;
-- update overseer.students set name='Riyec Lester' where _id=19;
-- update overseer.students set name='Stanza Eisahn' where _id=20;
-- update overseer.students set name='Delcep Jasha' where _id=21;
-- update overseer.students set name='Sybegh Febri' where _id=22;
-- update overseer.students set name='Jorel Makesa' where _id=23;
-- update overseer.students set name='Nil Sunspot'where  _id=24;
-- update overseer.students set name='Syrena Modun' where _id=25;
-- update overseer.students set name='Addison Nunes' where _id=26;
-- update overseer.students set name='Hiram Hethna' where _id=27;
-- update overseer.students set name='Nosh Ker Ghent' where _id=28;
-- update overseer.students set name='Squessibionaro Volsh' where _id=29;
-- update overseer.students set name='Giriz Cata' where _id=30;
-- update overseer.students set name='Darth Trammer' where _id=31;
-- update overseer.students set name='Derin Youngblood' where _id=32;
-- update overseer.students set name='Iocasta Dewan' where _id=33;
-- update overseer.students set name='Dei Dol' where _id=34;
-- update overseer.students set name='Leon Zih' where _id=35;
-- update overseer.students set name='Auugu Roeder' where _id=36;
-- update overseer.students set name='Wile Ktrame' where _id=37;
-- update overseer.students set name='Philipp Umdal' where _id=38;
-- update overseer.students set name='Yurist Quizan' where _id=39;
-- update overseer.students set name='Ala Taurendil' where _id=40;
-- update overseer.students set name='Fuil Chance' where _id=41;
-- update overseer.students set name='Paldamar Athan' where _id=42;
-- update overseer.students set name='Ben Brin' where _id=43;
-- update overseer.students set name='Europa Kestal' where _id=44;
-- update overseer.students set name='Xathas Cage' where _id=45;
-- update overseer.students set name='Warryk Joyriak' where _id=46;
-- update overseer.students set name='Pexereca Pollard' where _id=47;
-- update overseer.students set name='Dorn Kosokhan' where _id=48;
-- update overseer.students set name='Philipp Waray' where _id=49;
-- update overseer.students set name='Pacer Sixxkiller' where _id=50;
-- update overseer.students set name='Imay Ashen' where _id=51;
-- update overseer.students set name='Perth Warner' where _id=52;
-- update overseer.students set name='Maxon Lund' where _id=53;
-- update overseer.students set name='Keyan Omega' where _id=54;
-- update overseer.students set name='Cyern Brahnx' where _id=55;
-- update overseer.students set name='Frank Jahsop' where _id=56;
-- update overseer.students set name='Natan Tendoora' where _id=57;
-- update overseer.students set name='Orus Lassic' where _id=58;
-- update overseer.students set name='Jaden Holst' where _id=59;
-- update overseer.students set name='Lizzy Versio' where _id=60;
-- update overseer.students set name='Daska Nizzre' where _id=61;
-- update overseer.students set name='Ingo Ran-shok' where _id=62;
-- update overseer.students set name='Vosh Sheotah' where _id=63;
-- update overseer.students set name='Thaneo Rethana' where _id=64;
-- update overseer.students set name='Gaen Onasi' where _id=65;
-- update overseer.students set name='Bentha Lassic' where _id=66;
-- update overseer.students set name='Icio Kavos' where _id=67;
-- update overseer.students set name='Rhil Thaxton' where _id=68;
-- update overseer.students set name='Drago Solomon' where _id=69;
-- update overseer.students set name='Jens Landala' where _id=70;
-- update overseer.students set name='Plaba Senreiko' where _id=71;
-- update overseer.students set name='Korwin McGhee' where _id=72;
-- update overseer.students set name='Jensi Schmitt' where _id=73;
-- update overseer.students set name='Zev Riburn' where _id=74;
-- update overseer.students set name='Logra Mefrid' where _id=75;
-- update overseer.students set name='Rayfe Dorien' where _id=76;
-- update overseer.students set name='Hurley Mindar' where _id=77;
-- update overseer.students set name='Alejandro Brower' where _id=78;
-- update overseer.students set name='Ranneth Thane' where _id=79;
-- update overseer.students set name='Cerone Thek' where _id=80;
-- update overseer.students set name='Estefan  Kothari' where _id=81;
-- update overseer.students set name='Seit Dymos' where _id=82;
-- update overseer.students set name='Ariel Denive' where _id=83;
-- update overseer.students set name='Skye Vin Deova' where _id=84;
-- update overseer.students set name='Kath Kennison' where _id=85;
-- update overseer.students set name='Darren Marshall' where _id=86;
-- update overseer.students set name='Kasari Nise' where _id=87;
-- update overseer.students set name='Remmy Ashukahwa' where _id=88;
-- update overseer.students set name='Talon Rehal' where _id=89;
-- update overseer.students set name='Tressk Allerti' where _id=90;
-- update overseer.students set name='Candurous Obarel' where _id=91;
-- update overseer.students set name='Darnius Cridmeen' where _id=92;
-- update overseer.students set name='Qurzit Torwyn' where _id=93;
-- update overseer.students set name='Korynn Erelen' where _id=100;
-- update overseer.students set name='Jzora Ren' where _id=96;
-- update overseer.students set name='Ehissra Garoon' where _id=99;
-- update overseer.students set name='Garok Cormin' where _id=94;
-- update overseer.students set name='Juroden Nevran' where _id=95;
-- update overseer.students set name='Kameis Colton' where _id=112;
-- update overseer.students set name='Darryn Manchu' where _id=116;
-- update overseer.students set name='Adiara Akura' where _id=111;
-- update overseer.students set name='Tiru Sayul' where _id=108;
-- update overseer.students set name='Derek Jor' where _id=117;
-- update overseer.students set name='Deel Lorennion' where _id=118;
-- update overseer.students set name='Sarli Niktono' where _id=102;
-- update overseer.students set name='Norwan Vrei' where _id=119;
-- update overseer.students set name='Ral Komad' where _id=120;
-- update overseer.students set name='Lerak Gallamby' where _id=109;
-- update overseer.students set name='Miles Kennison' where _id=121;
-- update overseer.students set name='Jorund Geilvta' where _id=122;
-- update overseer.students set name='Aramis Reetat' where _id=123;
-- update overseer.students set name='Shaneeka Zhagel' where _id=103;
-- update overseer.students set name='Linora Roice' where _id=124;
-- update overseer.students set name='Tazer Starr' where _id=125;
-- update overseer.students set name='Opuurin Gatheri' where _id=113;
-- update overseer.students set name='Ral Mefrid' where _id=97;
-- update overseer.students set name='Deel Senreiko' where _id=107;
-- update overseer.students set name='Arathilion Cote' where _id=106;
-- update overseer.students set name='Duru Urope' where _id=105;
-- update overseer.students set name='Cuhan Tosh' where _id=98;
-- update overseer.students set name='Skylar Terrik' where _id=101;
-- update overseer.students set name='Milbin Dewan' where _id=114;
-- update overseer.students set name='Nial Loms' where _id=110;
-- update overseer.students set name='Zyras Joyriak' where _id=104;
-- update overseer.students set name='Kayna Eberle' where _id=115;

-- select * from students;

-- Turns out that heroku restarts the dyno once a day,
-- and that means storing sessions in memory means you get
-- logged out each time... time to store in DB!

-- Turns out that Postgres has a default timezone, 
-- and of course my local machine timezone is "localtime" and
-- the heroku database is 'UTC'...
-- show timezone;   => 'localtime' 
-- set timezone='UTC';     => SET  (only works for that connectiON)
-- can be reset at the postgresql.conf file found in 
-- SHOW config_file; 
-- edit the timezone to 'UTC' then reload it with
-- select * from pg_reload_conf();


-- make postgres dump
-- pg_dump dbname > filename
