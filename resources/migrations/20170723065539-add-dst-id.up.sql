ALTER TABLE overseer.students ADD COLUMN dst_id int;

--;;

ALTER TABLE overseer.students ADD CONSTRAINT stu_uniq_dst_id unique(dst_id);
