create type build_status as enum ('queued', 'running', 'finished', 'deleted', 'unknown');

alter type build_status owner to postgres;

create table suite
(
    id          varchar(255)               not null
        primary key,
    description varchar(255)               not null,
    created_at  timestamp(3) default now() not null,
    updated_at  timestamp(3)               not null,
    name        varchar(255)               not null,
    index       boolean      default false not null
);

alter table suite
    owner to postgres;

create table build
(
    suite_id   varchar(255)               not null
        references suite,
    tenant     varchar(255)               not null,
    state      dashboard.build_status     not null,
    created_at timestamp(3) default now() not null,
    updated_at timestamp(3)               not null,
    id         integer                    not null
        primary key
);

alter table build
    owner to postgres;

create table test
(
    id         varchar(255)               not null
        primary key,
    suite_id   varchar(255)               not null
        references suite,
    class_name varchar(255)               not null,
    created_at timestamp(3) default now() not null,
    updated_at timestamp(3)               not null
);

alter table test
    owner to postgres;

create table test_occurrence
(
    id         varchar(255)               not null
        primary key,
    test_id    varchar(255)               not null
        references test,
    status     varchar(255)               not null,
    duration   integer                    not null,
    href       varchar(255)               not null,
    ignored    boolean                    not null,
    created_at timestamp(3) default now() not null,
    updated_at timestamp(3)               not null,
    build_id   integer                    not null
        references build
);

alter table test_occurrence
    owner to postgres;

create table "user"
(
    id         varchar(255)               not null
        primary key,
    email      varchar(255)               not null,
    created_at timestamp(3) default now() not null,
    updated_at timestamp(3)               not null
);

alter table "user"
    owner to postgres;

create table suite_favourite
(
    id         varchar(255)               not null
        primary key,
    suite_id   varchar(255)               not null
        references suite,
    user_id    varchar(255)               not null
        references "user",
    created_at timestamp(3) default now() not null,
    updated_at timestamp(3)               not null
);

alter table suite_favourite
    owner to postgres;

create table comment
(
    id          varchar(255)               not null
        primary key,
    user_id     varchar(255)               not null
        references "user",
    entity_id   varchar(255)               not null,
    entity_type varchar(255)               not null,
    content     varchar(255)               not null,
    created_at  timestamp(3) default now() not null,
    updated_at  timestamp(3)               not null
);

alter table comment
    owner to postgres;

create table label
(
    id         varchar(255)               not null
        primary key,
    name       varchar(255)               not null,
    created_at timestamp(3) default now() not null,
    updated_at timestamp(3)               not null
);

alter table label
    owner to postgres;

create table suite_comment
(
    id         varchar(255)               not null
        primary key,
    suite_id   varchar(255)               not null
        references suite,
    comment_id varchar(255)               not null
        references comment,
    created_at timestamp(3) default now() not null,
    updated_at timestamp(3)               not null
);

alter table suite_comment
    owner to postgres;

create table build_comment
(
    id         varchar(255)               not null
        primary key,
    comment_id varchar(255)               not null
        references comment,
    created_at timestamp(3) default now() not null,
    updated_at timestamp(3)               not null,
    build_id   integer                    not null
        references build
);

alter table build_comment
    owner to postgres;

create table test_comment
(
    id         varchar(255)               not null
        primary key,
    test_id    varchar(255)               not null
        references test,
    comment_id varchar(255)               not null
        references comment,
    created_at timestamp(3) default now() not null,
    updated_at timestamp(3)               not null
);

alter table test_comment
    owner to postgres;

create table test_occurrence_comment
(
    id                 varchar(255)               not null
        primary key,
    test_occurrence_id varchar(255)               not null
        references test_occurrence,
    comment_id         varchar(255)               not null
        references comment,
    created_at         timestamp(3) default now() not null,
    updated_at         timestamp(3)               not null
);

alter table test_occurrence_comment
    owner to postgres;

create table suite_label
(
    id         varchar(255)               not null
        primary key,
    suite_id   varchar(255)               not null
        references suite,
    label_id   varchar(255)               not null
        references label,
    created_at timestamp(3) default now() not null,
    updated_at timestamp(3)               not null,
    "userId"   varchar(255)               not null
        references "user"
            on update cascade on delete restrict
);

alter table suite_label
    owner to postgres;

create table build_label
(
    id         varchar(255)               not null
        primary key,
    label_id   varchar(255)               not null
        references label,
    created_at timestamp(3) default now() not null,
    updated_at timestamp(3)               not null,
    build_id   integer                    not null
        references build,
    "userId"   varchar(255)               not null
        references "user"
            on update cascade on delete restrict
);

alter table build_label
    owner to postgres;

create table test_label
(
    id         varchar(255)               not null
        primary key,
    test_id    varchar(255)               not null
        references test,
    label_id   varchar(255)               not null
        references label,
    created_at timestamp(3) default now() not null,
    updated_at timestamp(3)               not null,
    "userId"   varchar(255)               not null
        references "user"
            on update cascade on delete restrict
);

alter table test_label
    owner to postgres;

create table test_occurrence_label
(
    id                 varchar(255)               not null
        primary key,
    test_occurrence_id varchar(255)               not null
        references test_occurrence,
    label_id           varchar(255)               not null
        references label,
    created_at         timestamp(3) default now() not null,
    updated_at         timestamp(3)               not null,
    "userId"           varchar(255)               not null
        references "user"
            on update cascade on delete restrict
);

alter table test_occurrence_label
    owner to postgres;

create table build_results_summary
(
    build_id integer not null
        primary key
        references build
            on update cascade on delete restrict,
    passed   integer not null,
    failed   integer not null,
    ignored  integer not null
);

alter table build_results_summary
    owner to postgres;


