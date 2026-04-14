# Diccionario de Datos (DB_SCHEMA) - Saiya Gym

Este archivo sirve como referencia rápida del esquema actual de la base de datos PostgreSQL, extraído de las migraciones. El Guardián debe usar esta información para evaluar cambios y evitar tablas innecesarias.

## Tablas y Propósitos

- **areas** (`id_area`, `nombre_area`, `descripcion`)
  Áreas físicas del gimnasio.
- **clases** (`id_clase`, `id_empleado`, `nombre_clase`, `duracion`, `nivel`)
  Clases o sesiones ofrecidas por los empleados/entrenadores.
- **cliente_membresia** (`id_cliente_membresia`, `id_cliente`, `id_membresia`, `fecha_inicio`, `fecha_fin`, `estado`)
  Relación de las membresías que tienen los clientes.
- **clientes** (`id_cliente`, `fecha_registro`)
  Registro de los usuarios del gimnasio (hereda/extiende de `personas`).
- **detalle_pago** (`id_detalle_pago`, `id_pago`, `id_membresia`, `id_promocion`, `id_inscripcion`, `id_insumo`, `cantidad`, `precio_unitario`, `sub_total`)
  Conceptos específicos desglosados en cada pago o transacción.
- **empleados** (`id_empleado`, `id_tipo_contrato`, `id_puesto`, `salario_actual`, `fecha_contratacion`)
  Personal que trabaja en el gimnasio (hereda/extiende de `personas`).
- **equipos** (`id_equipo`, `id_proveedor`, `id_area`, `nombre`, `estado`, `fecha_compra`)
  Maquinaria y equipo del gimnasio, vinculados a áreas y proveedores.
- **genero** (`id_genero`, `descripcion`)
  Catálogo de géneros.
- **incidencias** (`id_incidencia`, `id_tipo_incidencia`, `id_equipo`, `id_area`, `id_persona_afectada`, `descripcion`, `fecha`)
  Reporte de fallas, problemas con el equipo o situaciones anómalas deportivas.
- **inscripciones** (`id_inscripcion`, `id_cliente`, `id_clase`, `fecha_inscripcion`)
  Registro de clientes matriculados a clases particulares.
- **insumos** (`id_insumo`, `id_proveedor`, `nombre`, `cantidad`)
  Productos de inventario o consumibles provistos por externos.
- **medios_contacto** (`id_medio_contacto`, `id_persona`, `id_proveedor`, `telefono`, `correo_electronico`)
  Detalles de contacto, unificados tanto para personas como proveedores.
- **membresias** (`id_membresia`, `nombre`, `descripcion`, `duracion_meses`, `costo`)
  Catálogo de planes y membresías ofrecidas por el gym.
- **nomina** (`id_nomina`, `id_empleado`, `periodo`, `salario_base`, `bonos`, `deducciones`, `total_a_pagar`, `fecha_pago`)
  Registro de los pagos y deducciones salariales a empleados.
- **pagos** (`id_pago`, `id_cliente`, `monto_total`, `fecha_pago`, `metodo_pago`)
  Transacciones monetarias de tipo macro o "cabecera" de nota.
- **personas** (`id_persona`, `nombre`, `apellido_paterno`, `apellido_materno`, `id_genero`)
  Tabla base/central para datos personales que engloba clientes y empleados.
- **proveedor** (`id_provider`, `nombre`, `tipo_provider`)
  Empresas o terceros que suministran equipos o insumos.
- **puesto** / **puestos** (`id_puesto`, `nombre_puesto`)
  Catálogo de posiciones laborales dentro del negocio.
- **registro_acceso** (`id_registro`, `id_cliente`, `fecha`, `hora_entrada`, `hora_salida`)
  Control de accesos y asistencias a las instalaciones por parte de los clientes.
- **tipo_contrato** (`id_tipo_contrato`, `descripcion`)
  Catálogo de formatos de vinculación laboral.
- **tipo_incidencia** (`id_tipo_incidencia`, `descripcion`)
  Catálogo de categorías para los problemas o incidencias.

*(Generado automáticamente en base a las migraciones en `/supabase/migrations/`)*
