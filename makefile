philly-prod-git := git@heroku.com:shining-overseer.git
web-test-git := git@heroku.com:shining-overseer-test.git

T :
	@echo deploy-test
	@echo deploy-philly
	@echo log-philly
	@echo unit-test
	@echo "sql-philly - connect to philly postgres prod database"
	@echo "setup-prod-demo-data - fill the demo database with safe data"
	@echo webdriver-test
	@echo drop-tables
	@echo load-massive-dump
	@echo load-aliased-dump
	@echo backup-aliased-dump "for backing up a database after migrating"
	@echo sql-backup-local-restore
	@echo sql-local - connect to local database
	@echo "sql-philly-backup - make backup of philly prod database"
	@echo "logs - tail of local logs"
	@echo "start - start a running overseer site"

	@echo generate-sequence-reset
	@echo run-sequence-reset
	@echo deploy-philly
	@echo minify
	@echo js
	@echo watch

# example of ls and echo
hello :
	ls
	@echo Done

deploy-test :
	git push $(web-test-git) master

setup-prod-demo-data :
	heroku pg:psql --app shining-overseer < demo/demo-data.sql

log-philly :
	heroku logs --app shining-overseer

sql-philly :
	heroku pg:psql --app shining-overseer

sql-philly-backup :
	heroku pg:backups capture --app shining-overseer
	curl -o latest.dump `heroku pg:backups public-url -a shining-overseer`

sql-backup-local-restore :
	pg_restore --verbose --clean --no-acl --no-owner -h localhost -U postgres -d swipes latest.dump

generate-sequence-reset :
	psql -h localhost -U postgres -d swipes -Atq -f reset.sql -o genreset.sql

run-sequence-reset :
	psql -f genreset.sql

deploy-philly : generate-sequence-reset
	echo 'do you need to run the sequence reset?'
	./prod-deploy.sh $(philly-prod-git)

logs :
	tail -f log/app.log

start :
	lein run -m overseer.web
# lein ring server-headless 5000

debug :
	lein with-profile debug run -m overseer.web

unit-test :
	lein test

webdriver-test :
	lein test :integration

# createuser jack -U postgres
# grant all privileges on database swipes to jack;
# ALTER USER jack WITH SUPERUSER;
# insert into classes_X_students (class_id, student_id) select 1, _id from students;
drop-tables :
	psql -d swipes -c "DROP TABLE IF EXISTS schema_migrations; DROP FUNCTION IF EXISTS phillyfreeschool.school_days(text, bigint); DROP TABLE IF EXISTS phillyfreeschool.users; DROP TABLE IF EXISTS phillyfreeschool.years; DROP TABLE IF EXISTS phillyfreeschool.classes_X_students; DROP TABLE IF EXISTS phillyfreeschool.classes; DROP FUNCTION IF EXISTS phillyfreeschool.school_days(text); DROP VIEW IF EXISTS phillyfreeschool.roundedswipes; DROP TABLE IF EXISTS phillyfreeschool.swipes; DROP TABLE IF EXISTS session_store; DROP TABLE IF EXISTS phillyfreeschool.students; DROP TABLE IF EXISTS phillyfreeschool.excuses; DROP TABLE IF EXISTS phillyfreeschool.overrides; DROP TABLE IF EXISTS years; DROP TABLE IF EXISTS classes_X_students; DROP TABLE IF EXISTS classes; DROP FUNCTION IF EXISTS school_days(text); DROP VIEW IF EXISTS roundedswipes; DROP TABLE IF EXISTS swipes; DROP TABLE IF EXISTS session_store; DROP TABLE IF EXISTS students; DROP TABLE IF EXISTS excuses; DROP TABLE IF EXISTS overrides; "

sql-local :
	psql -d swipes

load-massive-dump : drop-tables
	psql swipes < massive.dump

load-aliased-dump : drop-tables
	psql swipes < dumps/updated-students-aliased.dump

backup-aliased-dump :
	pg_dump swipes > dumps/updated-students-aliased.dump

minify :
	browserify -t reactify -t uglifyify ./src/js/app.jsx -o ./resources/public/js/gen/app.js

js :
	browserify -t babelify ./src/js/app.jsx -o ./resources/public/js/gen/app.js --debug

watch :
	watchify -v -t babelify ./src/js/app.jsx -o ./resources/public/js/gen/app.js --debug

