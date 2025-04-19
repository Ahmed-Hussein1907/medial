create table medical_reports (
   id             number
      generated always as identity
   primary key,
   patient_id     number,
   report_name    varchar2(100),
   report_type    varchar2(100),
   report_comment varchar2(4000),
   report_date    date default sysdate,
   constraint fk_patient foreign key ( patient_id )
      references users ( id )
         on delete cascade
);