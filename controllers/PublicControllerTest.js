
const {testEmail} = require('../services/testEmail');
const { pagoAceptado } = require('../services/pagoAceptadoEmail');
const { pagoRechazado } = require('../services/pagoRechazadoEmail');


const super_user = [
    {
      menu: "Mi cuenta",
      key: "perfil",
      key_id: 0,
      permisos: [
        {
          titulo: "Ver todo el módulo de mi cuenta",
          key: "view",
          permiso: true,
        },
        {
          titulo: "Cambiar contraseña y datos de usuario",
          key: "edit",
          permiso: true,
        },      
      ],
      submenu: [
        {
          menu: "Mis direcciones",
          key: "direcciones",
          key_id: 1,
          permisos: [
            {
              titulo: "Ver direcciones de envío",
              key: "view",
              permiso: true,
            },
            {
              titulo:
                "Actualizar direcciones de envío y de ellas seleccionar la predeterminada",
              key: "edit",
              permiso: true,
            },
            {
              titulo: "Crear nuevas direcciones de envío",
              key: "create",
              permiso: true,
            },
            {
              titulo: "Eliminar direcciones de envío",
              key: "delete",
              permiso: true,
            },
          ],
        },
        {
          menu: "Perfiles de acceso",
          key: "usuarios",
          key_id: 2,
          permisos: [
            {
              titulo: "Ver usuarios del cliente",
              key: "view",
              permiso: true,
            },
            {
              titulo: "Actualizar usuarios del cliente y sus permisos",
              key: "edit",
              permiso: true,
            },
            {
              titulo: "Crear nuevos usuarios del cliente",
              key: "create",
              permiso: true,
            },
            {
              titulo: "Eliminar usuarios del cliente",
              key: "delete",
              permiso: true,
            },
          ],
        },
      ],
    },
    {
      menu: "Mi Estado de Cuenta",
      key: "facturas",
      key_id: 3,
      permisos: [
        {
          titulo: "Acceso módulo de estado de cuenta",
          key: "view",
          permiso: true,
        },
        {
          titulo: "Acceso a estado de cuenta y consultar mi crédito",
          key: "view_credit",
          permiso: true,
        },
      ],
    },
    {
      menu: "Mis pedidos",
      key: "pedidos",
      key_id: 4,
      permisos: [
        {
          titulo: "Acceso módulo de mis pedidos",
          key: "view",
          permiso: true,
        },
        {
          titulo: "Cancelar pedidos",
          key: "edit",
          permiso: true,
        },
      ],
    },
    // {
    //   menu: "Mis cotizaciones y proyectos",
    //   key: "cotizaciones",
    //   key_id: 5,
    //   permisos: [
    //     {
    //       titulo: "Historial de cotizaciones y proyectos",
    //       key: "view",
    //       permiso: true,
    //     },
    //     {
    //       titulo: "Modificación de cotizaciones de cotizaciones y proyectos",
    //       key: "edit",
    //       permiso: true,
    //     },
    //     {
    //       titulo: "Crear cotizaciones y proyectos",
    //       key: "create",
    //       permiso: true,
    //     },
    //     {
    //       titulo: "Eliminar cotizaciones y proyectos",
    //       key: "delete",
    //       permiso: true,
    //     },
    //   ],
    // },  
    // {
    //   menu: "Mis favoritos",
    //   key: "favoritos",
    //   key_id: 6,
    //   permisos: [
    //     {
    //       titulo: "Ver mi lista de favoritos",
    //       key: "view",
    //       permiso: true,
    //     },
    //     {
    //       titulo: "Actualizar mi lista de favoritos",
    //       key: "edit",
    //       permiso: true,
    //     },
    //   ],
    // },
  ];
  
const user_b2b =  [
    {
      menu: "Mi cuenta",
      key: "perfil",
      key_id: 0,
      permisos: [
        {
          titulo: "Ver todo el módulo de mi cuenta",
          key: "view",
          permiso: true,
        },
        {
          titulo: "Cambiar contraseña y datos de usuario",
          key: "edit",
          permiso: true,
        },
      ],
      submenu: [
        {
          menu: "Mis direcciones",
          key: "direcciones",
          key_id: 1,
          permisos: [
            {
              titulo: "Ver direcciones de envío",
              key: "view",
              permiso: true,
            },
            {
              titulo:
                "Actualizar direcciones de envío y de ellas seleccionar la predeterminada",
              key: "edit",
              permiso: true,
            },
            {
              titulo: "Crear nuevas direcciones de envío",
              key: "create",
              permiso: true,
            },
            {
              titulo: "Eliminar direcciones de envío",
              key: "delete",
              permiso: true,
            },
          ],
        },
      ],
    },
    {
      menu: "Mi Estado de Cuenta",
      key: "facturas",
      key_id: 3,
      permisos: [
        {
          titulo: "Acceso módulo de estado de cuenta",
          key: "view",
          permiso: true,
        },
        {
          titulo: "Acceso a estado de cuenta y consultar mi crédito",
          key: "view_credit",
          permiso: true,
        },
      ],
    },
    {
      menu: "Mis pedidos",
      key: "pedidos",
      key_id: 4,
      permisos: [
        {
          titulo: "Acceso módulo de mis pedidos",
          key: "view",
          permiso: true,
        },
        {
          titulo: "Cancelar pedidos",
          key: "edit",
          permiso: true,
        },
      ],
    },
    // {
    //   menu: "Mis cotizaciones y proyectos",
    //   key: "cotizaciones",
    //   key_id: 5,
    //   permisos: [
    //     {
    //       titulo: "Historial de cotizaciones y proyectos",
    //       key: "view",
    //       permiso: true,
    //     },
    //     {
    //       titulo: "Modificación de cotizaciones de cotizaciones y proyectos",
    //       key: "edit",
    //       permiso: true,
    //     },
    //     {
    //       titulo: "Crear cotizaciones y proyectos",
    //       key: "create",
    //       permiso: true,
    //     },
    //     {
    //       titulo: "Eliminar cotizaciones y proyectos",
    //       key: "delete",
    //       permiso: true,
    //     },
    //   ],
    // },
    // {
    //   menu: "Mis favoritos",
    //   key: "favoritos",
    //   key_id: 6,
    //   permisos: [
    //     {
    //       titulo: "Ver mi lista de favoritos",
    //       key: "view",
    //       permiso: true,
    //     },
    //     {
    //       titulo: "Actualizar mi lista de favoritos",
    //       key: "edit",
    //       permiso: true,
    //     },
    //   ],
    // },
  ];
export default {
    testEmailPublic: async(req, res, next) =>{
        try{
            await testEmail(req.body.email, req.body.html);
            res.status(200).send({
                message: 'Correo enviado'
            });
        }catch(e){
           res.status(500).send({
               message: 'Error envíar correo',

           });
           next(e);
        }
    },
    pruebaPedidoAprovado: async(req, res, next) =>{
        try{
            //email destino, idsocio, orden 
            await pagoAceptado('hernan@puntocommerce.com', 51, '162326545282561');
            res.status(200).send({
                message: 'Detalle de pedido enviado'
            });
        }catch(e){
            res.status(500).send({
                message: 'No se pudo completar la operación',
                e
            });
            next(e);
        }
    },
    pruebaPagoRechazado: async(req, res, next) =>{
        try{
            await pagoRechazado('hernan@puntocommerce.com');
            res.status(200).send({
                message: 'Correo rechazo enviado'
            });
        }catch(e){
            res.status(200).send({
                message: 'Error al procesar la solicitud',
                e
            });
            next(e);
        }
    },
    getAdmin: async(req, res, next) =>{
        try{
            res.status(200).send({
                message: 'Menú Admin',
                super_user
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al generar la peticíon',
                e
            });
            next(e);
        }
    },
    getUsuario: async(req, res, next) =>{
        try{
            res.status(200).send({
                message: 'Menú Usuario',
                user_b2b
            })
        }catch(e){
            res.status(500).send({
                message: 'Error al generar la peticíon',
                e
            });
            next(e);
        }

    }
}