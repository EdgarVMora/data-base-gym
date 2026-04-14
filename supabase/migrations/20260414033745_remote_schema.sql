


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."areas" (
    "id_area" integer NOT NULL,
    "nombre_area" "text" NOT NULL,
    "descripcion" "text"
);


ALTER TABLE "public"."areas" OWNER TO "postgres";


ALTER TABLE "public"."areas" ALTER COLUMN "id_area" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."areas_id_area_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."clases" (
    "id_clase" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_empleado" "uuid",
    "nombre_clase" "text" NOT NULL,
    "duracion" interval,
    "nivel" "text"
);


ALTER TABLE "public"."clases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cliente_membresia" (
    "id_cliente_membresia" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_cliente" "uuid",
    "id_membresia" "uuid",
    "fecha_inicio" "date" DEFAULT CURRENT_DATE,
    "fecha_fin" "date",
    "estado" "text"
);


ALTER TABLE "public"."cliente_membresia" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clientes" (
    "id_cliente" "uuid" NOT NULL,
    "fecha_registro" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."clientes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."detalle_pago" (
    "id_detalle_pago" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_pago" "uuid",
    "id_membresia" "uuid",
    "id_promocion" "uuid",
    "id_inscripcion" "uuid",
    "id_insumo" "uuid",
    "cantidad" integer DEFAULT 1,
    "precio_unitario" numeric(12,2),
    "sub_total" numeric(12,2)
);


ALTER TABLE "public"."detalle_pago" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."empleados" (
    "id_empleado" "uuid" NOT NULL,
    "id_tipo_contrato" integer,
    "id_puesto" integer,
    "salario_actual" numeric(12,2) DEFAULT 0 NOT NULL,
    "fecha_contratacion" "date" DEFAULT CURRENT_DATE
);


ALTER TABLE "public"."empleados" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."equipos" (
    "id_equipo" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_proveedor" "uuid",
    "id_area" integer,
    "nombre" "text" NOT NULL,
    "estado" "text",
    "fecha_compra" "date"
);


ALTER TABLE "public"."equipos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."genero" (
    "id_genero" integer NOT NULL,
    "descripcion" "text" NOT NULL
);


ALTER TABLE "public"."genero" OWNER TO "postgres";


ALTER TABLE "public"."genero" ALTER COLUMN "id_genero" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."genero_id_genero_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."incidencias" (
    "id_incidencia" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_tipo_incidencia" integer,
    "id_equipo" "uuid",
    "id_area" integer,
    "id_persona_afectada" "uuid",
    "descripcion" "text",
    "fecha" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."incidencias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inscripciones" (
    "id_inscripcion" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_cliente" "uuid",
    "id_clase" "uuid",
    "fecha_inscripcion" "date" DEFAULT CURRENT_DATE
);


ALTER TABLE "public"."inscripciones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."insumos" (
    "id_insumo" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_proveedor" "uuid",
    "nombre" "text" NOT NULL,
    "cantidad" integer DEFAULT 0
);


ALTER TABLE "public"."insumos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."medios_contacto" (
    "id_medio_contacto" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_persona" "uuid",
    "id_proveedor" "uuid",
    "telefono" "text",
    "correo_electronico" "text"
);


ALTER TABLE "public"."medios_contacto" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."membresias" (
    "id_membresia" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" "text" NOT NULL,
    "descripcion" "text",
    "duracion_meses" integer NOT NULL,
    "costo" numeric(12,2) NOT NULL
);


ALTER TABLE "public"."membresias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."nomina" (
    "id_nomina" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_empleado" "uuid",
    "periodo" "text" NOT NULL,
    "salario_base" numeric(12,2) NOT NULL,
    "bonos" numeric(12,2) DEFAULT 0,
    "deducciones" numeric(12,2) DEFAULT 0,
    "total_a_pagar" numeric(12,2) GENERATED ALWAYS AS ((("salario_base" + "bonos") - "deducciones")) STORED,
    "fecha_pago" "date" DEFAULT CURRENT_DATE
);


ALTER TABLE "public"."nomina" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pagos" (
    "id_pago" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_cliente" "uuid",
    "monto_total" numeric(12,2) NOT NULL,
    "fecha_pago" timestamp with time zone DEFAULT "now"(),
    "metodo_pago" "text"
);


ALTER TABLE "public"."pagos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."personas" (
    "id_persona" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" "text" NOT NULL,
    "apellido_paterno" "text" NOT NULL,
    "apellido_materno" "text",
    "id_genero" integer
);


ALTER TABLE "public"."personas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."proveedor" (
    "id_provider" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" "text" NOT NULL,
    "tipo_provider" "text"
);


ALTER TABLE "public"."proveedor" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."puesto" (
    "id_puesto" integer NOT NULL,
    "nombre_puesto" "text" NOT NULL
);


ALTER TABLE "public"."puesto" OWNER TO "postgres";


ALTER TABLE "public"."puesto" ALTER COLUMN "id_puesto" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."puesto_id_puesto_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."puestos" (
    "id_puesto" integer NOT NULL,
    "nombre_puesto" "text" NOT NULL
);


ALTER TABLE "public"."puestos" OWNER TO "postgres";


ALTER TABLE "public"."puestos" ALTER COLUMN "id_puesto" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."puestos_id_puesto_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."registro_acceso" (
    "id_registro" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_cliente" "uuid",
    "fecha" "date" DEFAULT CURRENT_DATE,
    "hora_entrada" time without time zone DEFAULT CURRENT_TIME,
    "hora_salida" time without time zone
);


ALTER TABLE "public"."registro_acceso" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tipo_contrato" (
    "id_tipo_contrato" integer NOT NULL,
    "descripcion" "text" NOT NULL
);


ALTER TABLE "public"."tipo_contrato" OWNER TO "postgres";


ALTER TABLE "public"."tipo_contrato" ALTER COLUMN "id_tipo_contrato" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."tipo_contrato_id_tipo_contrato_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tipo_incidencia" (
    "id_tipo_incidencia" integer NOT NULL,
    "descripcion" "text" NOT NULL
);


ALTER TABLE "public"."tipo_incidencia" OWNER TO "postgres";


ALTER TABLE "public"."tipo_incidencia" ALTER COLUMN "id_tipo_incidencia" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."tipo_incidencia_id_tipo_incidencia_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."areas"
    ADD CONSTRAINT "areas_pkey" PRIMARY KEY ("id_area");



ALTER TABLE ONLY "public"."clases"
    ADD CONSTRAINT "clases_pkey" PRIMARY KEY ("id_clase");



ALTER TABLE ONLY "public"."cliente_membresia"
    ADD CONSTRAINT "cliente_membresia_pkey" PRIMARY KEY ("id_cliente_membresia");



ALTER TABLE ONLY "public"."clientes"
    ADD CONSTRAINT "clientes_pkey" PRIMARY KEY ("id_cliente");



ALTER TABLE ONLY "public"."detalle_pago"
    ADD CONSTRAINT "detalle_pago_pkey" PRIMARY KEY ("id_detalle_pago");



ALTER TABLE ONLY "public"."empleados"
    ADD CONSTRAINT "empleados_pkey" PRIMARY KEY ("id_empleado");



ALTER TABLE ONLY "public"."equipos"
    ADD CONSTRAINT "equipos_pkey" PRIMARY KEY ("id_equipo");



ALTER TABLE ONLY "public"."genero"
    ADD CONSTRAINT "genero_pkey" PRIMARY KEY ("id_genero");



ALTER TABLE ONLY "public"."incidencias"
    ADD CONSTRAINT "incidencias_pkey" PRIMARY KEY ("id_incidencia");



ALTER TABLE ONLY "public"."inscripciones"
    ADD CONSTRAINT "inscripciones_pkey" PRIMARY KEY ("id_inscripcion");



ALTER TABLE ONLY "public"."insumos"
    ADD CONSTRAINT "insumos_pkey" PRIMARY KEY ("id_insumo");



ALTER TABLE ONLY "public"."medios_contacto"
    ADD CONSTRAINT "medios_contacto_correo_electronico_key" UNIQUE ("correo_electronico");



ALTER TABLE ONLY "public"."medios_contacto"
    ADD CONSTRAINT "medios_contacto_pkey" PRIMARY KEY ("id_medio_contacto");



ALTER TABLE ONLY "public"."membresias"
    ADD CONSTRAINT "membresias_pkey" PRIMARY KEY ("id_membresia");



ALTER TABLE ONLY "public"."nomina"
    ADD CONSTRAINT "nomina_pkey" PRIMARY KEY ("id_nomina");



ALTER TABLE ONLY "public"."pagos"
    ADD CONSTRAINT "pagos_pkey" PRIMARY KEY ("id_pago");



ALTER TABLE ONLY "public"."personas"
    ADD CONSTRAINT "personas_pkey" PRIMARY KEY ("id_persona");



ALTER TABLE ONLY "public"."proveedor"
    ADD CONSTRAINT "proveedor_pkey" PRIMARY KEY ("id_provider");



ALTER TABLE ONLY "public"."puesto"
    ADD CONSTRAINT "puesto_pkey" PRIMARY KEY ("id_puesto");



ALTER TABLE ONLY "public"."puestos"
    ADD CONSTRAINT "puestos_pkey" PRIMARY KEY ("id_puesto");



ALTER TABLE ONLY "public"."registro_acceso"
    ADD CONSTRAINT "registro_acceso_pkey" PRIMARY KEY ("id_registro");



ALTER TABLE ONLY "public"."tipo_contrato"
    ADD CONSTRAINT "tipo_contrato_pkey" PRIMARY KEY ("id_tipo_contrato");



ALTER TABLE ONLY "public"."tipo_incidencia"
    ADD CONSTRAINT "tipo_incidencia_pkey" PRIMARY KEY ("id_tipo_incidencia");



ALTER TABLE ONLY "public"."clases"
    ADD CONSTRAINT "clases_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "public"."empleados"("id_empleado");



ALTER TABLE ONLY "public"."cliente_membresia"
    ADD CONSTRAINT "cliente_membresia_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."clientes"("id_cliente") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cliente_membresia"
    ADD CONSTRAINT "cliente_membresia_id_membresia_fkey" FOREIGN KEY ("id_membresia") REFERENCES "public"."membresias"("id_membresia");



ALTER TABLE ONLY "public"."clientes"
    ADD CONSTRAINT "clientes_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."personas"("id_persona") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."detalle_pago"
    ADD CONSTRAINT "detalle_pago_id_membresia_fkey" FOREIGN KEY ("id_membresia") REFERENCES "public"."membresias"("id_membresia");



ALTER TABLE ONLY "public"."detalle_pago"
    ADD CONSTRAINT "detalle_pago_id_pago_fkey" FOREIGN KEY ("id_pago") REFERENCES "public"."pagos"("id_pago") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empleados"
    ADD CONSTRAINT "empleados_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "public"."personas"("id_persona") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empleados"
    ADD CONSTRAINT "empleados_id_puesto_fkey" FOREIGN KEY ("id_puesto") REFERENCES "public"."puesto"("id_puesto");



ALTER TABLE ONLY "public"."empleados"
    ADD CONSTRAINT "empleados_id_tipo_contrato_fkey" FOREIGN KEY ("id_tipo_contrato") REFERENCES "public"."tipo_contrato"("id_tipo_contrato");



ALTER TABLE ONLY "public"."equipos"
    ADD CONSTRAINT "equipos_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "public"."areas"("id_area");



ALTER TABLE ONLY "public"."equipos"
    ADD CONSTRAINT "equipos_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "public"."proveedor"("id_provider");



ALTER TABLE ONLY "public"."incidencias"
    ADD CONSTRAINT "incidencias_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "public"."areas"("id_area");



ALTER TABLE ONLY "public"."incidencias"
    ADD CONSTRAINT "incidencias_id_equipo_fkey" FOREIGN KEY ("id_equipo") REFERENCES "public"."equipos"("id_equipo");



ALTER TABLE ONLY "public"."incidencias"
    ADD CONSTRAINT "incidencias_id_persona_afectada_fkey" FOREIGN KEY ("id_persona_afectada") REFERENCES "public"."personas"("id_persona");



ALTER TABLE ONLY "public"."incidencias"
    ADD CONSTRAINT "incidencias_id_tipo_incidencia_fkey" FOREIGN KEY ("id_tipo_incidencia") REFERENCES "public"."tipo_incidencia"("id_tipo_incidencia");



ALTER TABLE ONLY "public"."inscripciones"
    ADD CONSTRAINT "inscripciones_id_clase_fkey" FOREIGN KEY ("id_clase") REFERENCES "public"."clases"("id_clase");



ALTER TABLE ONLY "public"."inscripciones"
    ADD CONSTRAINT "inscripciones_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."clientes"("id_cliente") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."insumos"
    ADD CONSTRAINT "insumos_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "public"."proveedor"("id_provider");



ALTER TABLE ONLY "public"."medios_contacto"
    ADD CONSTRAINT "medios_contacto_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "public"."personas"("id_persona") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."nomina"
    ADD CONSTRAINT "nomina_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "public"."empleados"("id_empleado");



ALTER TABLE ONLY "public"."pagos"
    ADD CONSTRAINT "pagos_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."clientes"("id_cliente");



ALTER TABLE ONLY "public"."personas"
    ADD CONSTRAINT "personas_id_genero_fkey" FOREIGN KEY ("id_genero") REFERENCES "public"."genero"("id_genero");



ALTER TABLE ONLY "public"."registro_acceso"
    ADD CONSTRAINT "registro_acceso_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."clientes"("id_cliente") ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "public"."areas" TO "anon";
GRANT ALL ON TABLE "public"."areas" TO "authenticated";
GRANT ALL ON TABLE "public"."areas" TO "service_role";



GRANT ALL ON SEQUENCE "public"."areas_id_area_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."areas_id_area_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."areas_id_area_seq" TO "service_role";



GRANT ALL ON TABLE "public"."clases" TO "anon";
GRANT ALL ON TABLE "public"."clases" TO "authenticated";
GRANT ALL ON TABLE "public"."clases" TO "service_role";



GRANT ALL ON TABLE "public"."cliente_membresia" TO "anon";
GRANT ALL ON TABLE "public"."cliente_membresia" TO "authenticated";
GRANT ALL ON TABLE "public"."cliente_membresia" TO "service_role";



GRANT ALL ON TABLE "public"."clientes" TO "anon";
GRANT ALL ON TABLE "public"."clientes" TO "authenticated";
GRANT ALL ON TABLE "public"."clientes" TO "service_role";



GRANT ALL ON TABLE "public"."detalle_pago" TO "anon";
GRANT ALL ON TABLE "public"."detalle_pago" TO "authenticated";
GRANT ALL ON TABLE "public"."detalle_pago" TO "service_role";



GRANT ALL ON TABLE "public"."empleados" TO "anon";
GRANT ALL ON TABLE "public"."empleados" TO "authenticated";
GRANT ALL ON TABLE "public"."empleados" TO "service_role";



GRANT ALL ON TABLE "public"."equipos" TO "anon";
GRANT ALL ON TABLE "public"."equipos" TO "authenticated";
GRANT ALL ON TABLE "public"."equipos" TO "service_role";



GRANT ALL ON TABLE "public"."genero" TO "anon";
GRANT ALL ON TABLE "public"."genero" TO "authenticated";
GRANT ALL ON TABLE "public"."genero" TO "service_role";



GRANT ALL ON SEQUENCE "public"."genero_id_genero_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."genero_id_genero_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."genero_id_genero_seq" TO "service_role";



GRANT ALL ON TABLE "public"."incidencias" TO "anon";
GRANT ALL ON TABLE "public"."incidencias" TO "authenticated";
GRANT ALL ON TABLE "public"."incidencias" TO "service_role";



GRANT ALL ON TABLE "public"."inscripciones" TO "anon";
GRANT ALL ON TABLE "public"."inscripciones" TO "authenticated";
GRANT ALL ON TABLE "public"."inscripciones" TO "service_role";



GRANT ALL ON TABLE "public"."insumos" TO "anon";
GRANT ALL ON TABLE "public"."insumos" TO "authenticated";
GRANT ALL ON TABLE "public"."insumos" TO "service_role";



GRANT ALL ON TABLE "public"."medios_contacto" TO "anon";
GRANT ALL ON TABLE "public"."medios_contacto" TO "authenticated";
GRANT ALL ON TABLE "public"."medios_contacto" TO "service_role";



GRANT ALL ON TABLE "public"."membresias" TO "anon";
GRANT ALL ON TABLE "public"."membresias" TO "authenticated";
GRANT ALL ON TABLE "public"."membresias" TO "service_role";



GRANT ALL ON TABLE "public"."nomina" TO "anon";
GRANT ALL ON TABLE "public"."nomina" TO "authenticated";
GRANT ALL ON TABLE "public"."nomina" TO "service_role";



GRANT ALL ON TABLE "public"."pagos" TO "anon";
GRANT ALL ON TABLE "public"."pagos" TO "authenticated";
GRANT ALL ON TABLE "public"."pagos" TO "service_role";



GRANT ALL ON TABLE "public"."personas" TO "anon";
GRANT ALL ON TABLE "public"."personas" TO "authenticated";
GRANT ALL ON TABLE "public"."personas" TO "service_role";



GRANT ALL ON TABLE "public"."proveedor" TO "anon";
GRANT ALL ON TABLE "public"."proveedor" TO "authenticated";
GRANT ALL ON TABLE "public"."proveedor" TO "service_role";



GRANT ALL ON TABLE "public"."puesto" TO "anon";
GRANT ALL ON TABLE "public"."puesto" TO "authenticated";
GRANT ALL ON TABLE "public"."puesto" TO "service_role";



GRANT ALL ON SEQUENCE "public"."puesto_id_puesto_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."puesto_id_puesto_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."puesto_id_puesto_seq" TO "service_role";



GRANT ALL ON TABLE "public"."puestos" TO "anon";
GRANT ALL ON TABLE "public"."puestos" TO "authenticated";
GRANT ALL ON TABLE "public"."puestos" TO "service_role";



GRANT ALL ON SEQUENCE "public"."puestos_id_puesto_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."puestos_id_puesto_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."puestos_id_puesto_seq" TO "service_role";



GRANT ALL ON TABLE "public"."registro_acceso" TO "anon";
GRANT ALL ON TABLE "public"."registro_acceso" TO "authenticated";
GRANT ALL ON TABLE "public"."registro_acceso" TO "service_role";



GRANT ALL ON TABLE "public"."tipo_contrato" TO "anon";
GRANT ALL ON TABLE "public"."tipo_contrato" TO "authenticated";
GRANT ALL ON TABLE "public"."tipo_contrato" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tipo_contrato_id_tipo_contrato_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tipo_contrato_id_tipo_contrato_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tipo_contrato_id_tipo_contrato_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tipo_incidencia" TO "anon";
GRANT ALL ON TABLE "public"."tipo_incidencia" TO "authenticated";
GRANT ALL ON TABLE "public"."tipo_incidencia" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tipo_incidencia_id_tipo_incidencia_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tipo_incidencia_id_tipo_incidencia_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tipo_incidencia_id_tipo_incidencia_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


