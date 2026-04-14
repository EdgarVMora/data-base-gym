-- ============================================================
-- SEED DATA — Saiya Gym (Primera prueba de conexión DB)
-- ============================================================

-- 1. Catálogos base
INSERT INTO public.genero (id_genero, descripcion) OVERRIDING SYSTEM VALUE
VALUES (1, 'Masculino'), (2, 'Femenino')
ON CONFLICT DO NOTHING;

-- 2. Membresías
INSERT INTO public.membresias (nombre, descripcion, duracion_meses, costo)
VALUES
  ('Classic', 'Solo acceso al gym y áreas comunes', 1, 400.00),
  ('Gold', 'Tiene acceso al gym, áreas comunes y clases', 1, 800.00),
  ('Premium', 'Tiene acceso al gym, áreas comunes, clases y descuentos del 30% en productos seleccionados', 1, 1300.00);

-- 3. Personas + medios de contacto
WITH p AS (INSERT INTO public.personas (nombre, apellido_paterno, apellido_materno, id_genero) VALUES ('Macario', 'Hernandez', 'Hernandez', 1) RETURNING id_persona)
INSERT INTO public.medios_contacto (id_persona, telefono, correo_electronico) SELECT id_persona, '2223456789', 'macacohh@hotmail.com' FROM p;

WITH p AS (INSERT INTO public.personas (nombre, apellido_paterno, apellido_materno, id_genero) VALUES ('Alison', 'Ocampo', 'Guitierrez', 2) RETURNING id_persona)
INSERT INTO public.medios_contacto (id_persona, telefono, correo_electronico) SELECT id_persona, '7774561224', 'alibebe@gmail.com' FROM p;

WITH p AS (INSERT INTO public.personas (nombre, apellido_paterno, apellido_materno, id_genero) VALUES ('Vladimir', 'Sanchez', 'Castillo', 1) RETURNING id_persona)
INSERT INTO public.medios_contacto (id_persona, telefono, correo_electronico) SELECT id_persona, '2468997653', 'vladi@gmail.com' FROM p;

WITH p AS (INSERT INTO public.personas (nombre, apellido_paterno, apellido_materno, id_genero) VALUES ('Cristian', 'Monrroy', 'Jimenez', 1) RETURNING id_persona)
INSERT INTO public.medios_contacto (id_persona, telefono, correo_electronico) SELECT id_persona, '7354566551', 'monrry@gmail.com' FROM p;

WITH p AS (INSERT INTO public.personas (nombre, apellido_paterno, apellido_materno, id_genero) VALUES ('Guillermino', 'Talavera', 'Suarez', 1) RETURNING id_persona)
INSERT INTO public.medios_contacto (id_persona, telefono, correo_electronico) SELECT id_persona, '5556566551', 'tala.arboles@gmail.com' FROM p;

WITH p AS (INSERT INTO public.personas (nombre, apellido_paterno, apellido_materno, id_genero) VALUES ('Vanessa', 'Vazquez', 'Juarez', 2) RETURNING id_persona)
INSERT INTO public.medios_contacto (id_persona, telefono, correo_electronico) SELECT id_persona, '2452223451', 'vanesita@gmail.com' FROM p;

WITH p AS (INSERT INTO public.personas (nombre, apellido_paterno, apellido_materno, id_genero) VALUES ('Julieta', 'Gonzalez', 'Perez', 2) RETURNING id_persona)
INSERT INTO public.medios_contacto (id_persona, telefono, correo_electronico) SELECT id_persona, '2456667564', 'July@gmail.com' FROM p;

WITH p AS (INSERT INTO public.personas (nombre, apellido_paterno, apellido_materno, id_genero) VALUES ('Galina', 'Montijo', 'Garcia', 2) RETURNING id_persona)
INSERT INTO public.medios_contacto (id_persona, telefono, correo_electronico) SELECT id_persona, '5554678992', 'montejo.ga@gmail.com' FROM p;

WITH p AS (INSERT INTO public.personas (nombre, apellido_paterno, apellido_materno, id_genero) VALUES ('Veronica', 'Bellingham', 'Perez', 2) RETURNING id_persona)
INSERT INTO public.medios_contacto (id_persona, telefono, correo_electronico) SELECT id_persona, '7772345672', 'vero.beli@gmail.com' FROM p;

WITH p AS (INSERT INTO public.personas (nombre, apellido_paterno, apellido_materno, id_genero) VALUES ('Omar', 'Bañuelos', 'Atonal', 1) RETURNING id_persona)
INSERT INTO public.medios_contacto (id_persona, telefono, correo_electronico) SELECT id_persona, '4453457778', 'atonal15@gmail.com' FROM p;
