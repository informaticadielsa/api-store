
const nodemailer = require("nodemailer");
import models from "../models";
const { Op } = require("sequelize");
import { Sequelize } from "sequelize";
const sequelize = new Sequelize(process.env.POSTGRESQL);
import date_and_time from "date-and-time";



// exports.creadaOrden = async function(email, id_usuario_socio, orden){
exports.cotizacionEnviar = async function (email,cotizacion_id) {
  try {
    var metodo_de_pago;


    //Variables cotizaciones
    const constCotizaciones = await models.Cotizaciones.findOne({
      where: {
        cot_cotizacion_id: cotizacion_id,
      },
    });

    const constCotizacionesProductos = await models.CotizacionesProductos.findAll({
      where: {
        cotp_cotizacion_id: constCotizaciones.cot_cotizacion_id,
      },
    });


    var cotizacionID = cotizacion_id
    var isProspecto = constCotizaciones.cot_prospecto
    var vendedorAsignado = ''
    var NoCotizacion = constCotizaciones.cot_numero_orden
    var fechaCotizacion = constCotizaciones.createdAt
    var Nombre
    var Correo
    var Telefono


    var estadoValorEntrega
    var estadoCodigoEntrega

    var paisValorEntrega
    var paisCodigoEntrega

    var direccionEntrega
    var coloniaEntrega
    var ciudadEntrega
    var codigo_postalEntrega


    var mantenerEnCopia = constCotizaciones.cot_mantener_copia

    var subTotal = constCotizaciones.cot_total_base
    var orderIVA = constCotizaciones.cot_iva_cantidad
    var costoEnvio = constCotizaciones.cot_costo_envio
    var descuentos = constCotizaciones.cot_total_base

    var formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });

    subTotal = formatter.format(subTotal);
    orderIVA = formatter.format(orderIVA);
    costoEnvio = formatter.format(costoEnvio);
    descuentos = formatter.format(descuentos);

    var totalCompra = constCotizaciones.cot_total_cotizacion;

    

    totalCompra = formatter.format(totalCompra);


    //Si es SN
    if(isProspecto == false)
    {
      //Obtener vendedor
      const constUsuarioVendedor = await models.Usuario.findOne({
        where: {
          usu_usuario_id: constCotizaciones.cot_usu_usuario_vendedor_id,
        },
      });
      if(constUsuarioVendedor)
      {
        vendedorAsignado = constUsuarioVendedor.usu_nombre + " " + constUsuarioVendedor.usu_primer_apellido + " " + constUsuarioVendedor.usu_segundo_apellido
      }

      //Obtener nombre SN
      const constSociosNegocioCotizacion = await models.SociosNegocio.findOne({
        where: {
          sn_socios_negocio_id: constCotizaciones.cot_sn_socios_negocio_id
        },
      });

      Nombre = constSociosNegocioCotizacion.sn_nombre_empresa

      //Correo
      Correo = constSociosNegocioCotizacion.sn_email_facturacion
      
      //Telefono
      Telefono = constSociosNegocioCotizacion.sn_telefono_empresa


    }
    //Si es prospecto
    else
    {
      vendedorAsignado = ''

      //Obtener nombre prospecto
      const constUsuariosProspectos = await models.UsuariosProspectos.findOne({
        where: {
          up_usuarios_prospectos_id: constCotizaciones.cot_up_usuarios_prospectos_id
        },
      });

      Nombre = constUsuariosProspectos.up_nombre_comercial

      //Correo
      Correo = constUsuariosProspectos.up_email_facturacion

      //Telefono
      Telefono = ''


    }








    var direccionIDTemp = constCotizaciones.cot_direccion_envio_id
    

   

    //obtener tipo de envio
    const constControlMaestroMultipleTipoEnvioCotizacion = await models.ControlMaestroMultiple.findOne({
      where: {
        cmm_control_id: constCotizaciones.cot_cmm_tipo_envio_id,
      },
    });

    var isRecoleccion = false;

    if (constControlMaestroMultipleTipoEnvioCotizacion.cmm_valor == "Recolección") {
      isRecoleccion = true;

      //Buscar direccion de recoleccion
      const constAlmacenesss = await models.Almacenes.findOne({
        where: {
          alm_almacen_id: constCotizaciones.cot_alm_almacen_recoleccion,
        },
      });

      //Buscar direccion de envio
      const constRawAlmacenes = await models.RawAlmacenes.findOne({
        where: {
          codigoAlmacen: constAlmacenesss.alm_codigoAlmacen,
        },
      });

      const constEstado = await models.Estado.findOne({
        where: {
          estpa_codigo_estado: constRawAlmacenes.estado,
        },
      });

      if (constEstado) {
        estadoValorEntrega = constEstado.dataValues.estpa_estado_nombre;
        estadoCodigoEntrega = constEstado.dataValues.estpa_codigo_estado;
      }

      const constPais = await models.Pais.findOne({
        where: {
          pais_abreviatura: constRawAlmacenes.pais,
        },
      });

      if (constPais) {
        paisValorEntrega = constPais.dataValues.pais_nombre;
      }

      console.log(66564);

      // Set direccion de envio
      direccionEntrega = constRawAlmacenes.calle;

      coloniaEntrega = "Col. " + constRawAlmacenes.colonia;

      console.log(455454);

      ciudadEntrega = constRawAlmacenes.ciudad;

      codigo_postalEntrega = "Cp. " + constRawAlmacenes.codigoPostal;
      console.log(8923489342);
    } 
    else 
    {
      //Generar Direccin de envio

      if(isProspecto == false)
      {
        //Buscar direccion de envio
        const constSociosNegocioDireccionesCot =
          await models.SociosNegocioDirecciones.findOne({
            where: {
              snd_direcciones_id: constCotizaciones.cot_direccion_envio_id,
            },
          });

        //Si existe el estado ID
        if (constSociosNegocioDireccionesCot.snd_estado_id) {
          const constEstado = await models.Estado.findOne({
            where: {
              estpa_estado_pais_id: constSociosNegocioDireccionesCot.snd_estado_id,
            },
          });

          if (constEstado) {
            estadoValorEntrega = constEstado.dataValues.estpa_estado_nombre;
            estadoCodigoEntrega = constEstado.dataValues.estpa_codigo_estado;
          }
        }

        //Si existe el pais ID
        if (constSociosNegocioDireccionesCot.snd_pais_id) {
          const constPais = await models.Pais.findOne({
            where: {
              pais_pais_id: constSociosNegocioDireccionesCot.snd_pais_id,
            },
          });

          if (constPais) {
            paisValorEntrega = constPais.dataValues.pais_nombre;
          }
        }

        // Set direccion de envio
        var constDireccionEnvio = constSociosNegocioDireccionesCot.dataValues;

        direccionEntrega = constDireccionEnvio.snd_direccion;

        if (constDireccionEnvio.snd_colonia) {
          coloniaEntrega = "Col. " + constDireccionEnvio.snd_colonia;
        }

        if (constDireccionEnvio.snd_ciudad) {
          ciudadEntrega = constDireccionEnvio.snd_ciudad;
        }

        if (constDireccionEnvio.snd_codigo_postal) {
          codigo_postalEntrega = "Cp. " + constDireccionEnvio.snd_codigo_postal;
        }
      }
      else
      {
        //Buscar direccion de envio
        const constUsuariosProspectosDirecciones =
          await models.UsuariosProspectosDirecciones.findOne({
            where: {
              upd_direcciones_id: constCotizaciones.cot_direccion_envio_id,
            },
          });

        //Si existe el estado ID
        if (constUsuariosProspectosDirecciones.upd_estado_id) {
          const constEstado = await models.Estado.findOne({
            where: {
              estpa_estado_pais_id: constUsuariosProspectosDirecciones.upd_estado_id,
            },
          });

          if (constEstado) {
            estadoValorEntrega = constEstado.dataValues.estpa_estado_nombre;
            estadoCodigoEntrega = constEstado.dataValues.estpa_codigo_estado;
          }
        }

        //Si existe el pais ID
        if (constUsuariosProspectosDirecciones.upd_pais_id) {
          const constPais = await models.Pais.findOne({
            where: {
              pais_pais_id: constUsuariosProspectosDirecciones.upd_pais_id,
            },
          });

          if (constPais) {
            paisValorEntrega = constPais.dataValues.pais_nombre;
          }
        }

        // Set direccion de envio
        var constDireccionEnvio = constUsuariosProspectosDirecciones.dataValues;

        console.log(constDireccionEnvio)

        direccionEntrega = constDireccionEnvio.upd_direccion;


        if (constDireccionEnvio.upd_colonia) {
          coloniaEntrega = "Col. " + constDireccionEnvio.upd_colonia;
        }

        if (constDireccionEnvio.upd_ciudad) {
          ciudadEntrega = constDireccionEnvio.upd_ciudad;
        }

        if (constDireccionEnvio.upd_codigo_postal) {
          codigo_postalEntrega = "Cp. " + constDireccionEnvio.upd_codigo_postal;
        }
      }
    }
    























    //-----------------------------------------------------------------
    // Definimos el transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER, // correo gmail temporal
        pass: process.env.EMAIL_PASSWORD, // Contraseña de aplicacion de google
      },
      // ignoreTLS: true,
      // secure: true,
      secureConnection: true,
      tls: { ciphers: "SSLv3" },
      requiresAuth: true,
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      //maxConnections: 10,
      debug: true,
    });

















    var htmlBody =
      `
                    <!DOCTYPE html>
              <html lang='es'>
              <head>
                <title>Nueva Cotización</title>
                <link href="` +
                  process.env.BACK_LINK +
                  `/recursos/bootstrap.min.css" rel="stylesheet">
                <style>
                  @font-face {
                    font-family: 'Centrale Sans Medium';
                    font-stretch: normal;
                    src: url('CentraleSans-Medium.woff') format('woff');
                  }

                  @font-face {
                    font-family: 'Centrale Sans Regular';
                    font-stretch: normal;
                    src: url('CentraleSansRegular.woff') format('woff');
                  }

                  @font-face {
                    font-family: 'Centrale Sans Light';
                    font-stretch: normal;
                    src: url('CentraleSans-Light.woff') format('woff');
                  }

                  @font-face {
                    font-family: 'Centrale Sans Medium';
                    font-stretch: normal;
                    src: url('CentraleSans-Medium.woff') format('woff');
                  }

                  .navbar img {
                      margin:0px auto;
                      display:block;
                  }

                  .content_data {
                    background-color: #f5f5f5;
                    padding: 30px;
                    font-size: 16px
                  }

                  .header_logo {
                    background-color: #0B3196; 
                    height: 100px; 
                    color: white; 
                    width: 100%; 
                    text-align: center;
                    display: inline-flex; 
                    justify-content: center; 
                    align-items: center;
                  }

                  body {
                    font-family: helvetica;
                  }

                  .btnGotoOrder{
                    font-size: 12px;
                    color: #ffffff !important;
                    background-color: #0B3196;
                    padding: 7px 10px;
                    border-radius: 3px;
                    text-decoration: none;
                  }

                  @media only screen and (max-width: 504px) {
                      body,table,td,p,a,li,blockquote {
                      -webkit-text-size-adjust:none !important;
                      }
                      table {width: 100% !important;}
                      .responsive-image img {
                      height: auto !important;
                      max-width: 100% !important;
                      width: 100% !important;
                      }
                      td{
                      text-align:center;
                      }
                  }
                </style>
              </head>
              <body align="center">
                <header class="header_logo" style="max-width:375px">
                  <img src='` + process.env.BACK_LINK + `/recursos/logo.png' / style='max-height: 70px; margin-top: 10px; margin: auto'>          
                </header>

              <section style='background: white; width: 90%; max-width: 375px; margin: 20px auto; text-align: -webkit-center; margin-top: 50px;'>
                <section align="center" id='main-content' style="text-align: -webkit-center;">
                
                
                <article>
                  <header>
                    <div style='color: #0B3196; font-size: 18px; font-weight: 500; letter-spacing: 0; padding: 0px 66px;'>
                      <h1>Tienes una nueva cotización por atender</h1>                
                    </div>
                    <div>




                        <p style="font-size:14px; padding: 10px 20px; text-align: justify;">Estimado ` 


                        if(isProspecto != false)
                        {

                          htmlBody += `contacto@dielsa.com, El prospecto ${Nombre} `
                        }
                        else
                        {
                          htmlBody += vendedorAsignado + `,El socio de negocio ${Nombre} `
                        }


                        htmlBody += `ha solicitado una cotización a través del sitio web.</p>
                    </div>
                    <div  style="width: 100%; background-color: #0B3196; text-align:center;">
                        <p style="font-family: 'Centrale Sans Regular'; color:white; font-size:18px; line-height: 30px; height: 31px;">Detalle de la cotización</p>
                    </div>
                  </header>
                    
                <div style='padding-left: 15px; padding-top: 0; color: #000000; font-size: 18px; font-weight: 600; letter-spacing: 0; line-height: 20px; text-align: justify;'>
                <div class='contenido'>
                  <p>No. de cotización:</p>
                </div>
                </div>
                <div style='padding-left: 15px; color: #000000; font-size: 16px; letter-spacing: 0; line-height: 0px; text-align: -webkit-left'>
                <div class='contenido1'>
                  <p>${NoCotizacion}</p>
                </div>
                </div>
                
                <div style='padding-left: 15px; padding-top: 1px; color: #000000; font-size: 18px; font-weight: 600; letter-spacing: 0; line-height: 20px; text-align: justify;'>
                  <div class='contenido'>
                    <p>Fecha de elaboración:</p>
                  </div>
                </div>
                <div style='padding-left: 15px; color: #000000; font-size: 16px; letter-spacing: 0; line-height: 1.5; text-align: -webkit-left'>
                  <div class='contenido1'>
                    <p>${fechaCotizacion}</p>
                  </div>
                </div>

                <div style='padding-left: 15px; padding-top: 1px; color: #000000; font-size: 18px; font-weight: 600; letter-spacing: 0; line-height: 20px; text-align: justify;'>
                  <div class='contenido'>
                    <p>Datos Personales:</p>
                  </div>
                </div>
                <div style='padding-left: 15px; color: #000000; font-size: 16px; letter-spacing: 0; line-height: 0px; text-align: -webkit-left'>
                  <div class='contenido1'>
                    <p>${Nombre}, ${Correo}, ${Telefono}</p>
                  </div>
                </div>

                <div style='padding-left: 15px; padding-top: 1px; color: #000000; font-size: 18px; font-weight: 600; letter-spacing: 0; line-height: 20px; text-align: justify;'>
                  <div class='contenido'>
                    <p>Dirección de entrega:</p>
                  </div>
                </div>
                <div style='padding-left: 15px; color: #000000; font-size: 16px; letter-spacing: 0; line-height: 1.5; text-align: -webkit-left'>
                  <div class='contenido1'>
                    <p>${direccionEntrega}, ${coloniaEntrega}, ${ciudadEntrega}, ${codigo_postalEntrega}</p>
                  </div>
                </div>

                <div style='padding-left: 15px; padding-top: 1px; color: #000000; font-size: 18px; font-weight: 600; letter-spacing: 0; line-height: 20px; text-align: justify;'>
                  <div class='contenido'>
                    <p>Mantener en copia:</p>
                  </div>
                </div>
                <div style='padding-left: 15px; color: #000000; font-size: 16px; letter-spacing: 0; line-height: 0px; text-align: -webkit-left'>
                  <div class='contenido1'>
                    <p>${mantenerEnCopia}</p>
                  </div>
                </div>`;

                console.log("AQUIIIIIIIIIIII")
                console.log(htmlBody)
htmlBody +=
        `<div style='border-bottom: 1px solid #000; padding-right: 15px;'>
          <div style='color: #0B3196; font-size: 18px; font-weight: 600; letter-spacing: 0; line-height: 20px; text-align: justify;'>
          <div class='contenidos'>
          </div>`;
var fecha_actual;
for (var x = 0; x < constCotizacionesProductos.length; x++) {
const constProducto = await models.Producto.findOne({
  where: {
    prod_producto_id:
      constCotizacionesProductos[x].dataValues.cotp_prod_producto_id,
  },
  attributes: ["prod_nombre", "prod_nombre_extranjero"],
});

const constImagenProducto = await models.ImagenProducto.findOne({
  where: {
    imgprod_prod_producto_id:
      constCotizacionesProductos[x].dataValues.cotp_prod_producto_id,
  },
  order: [["imgprod_nombre_archivo", "ASC"]],
});

var imagen;
var prod_nombre = constProducto.prod_nombre;
var prod_nombre_foraneo = constProducto.prod_nombre_extranjero;

var cantidad =
  constCotizacionesProductos[x].dataValues.cotp_producto_cantidad;

var precio = constCotizacionesProductos[x].dataValues.cotp_precio_base_lista;
precio = formatter.format(precio);

if (constImagenProducto) {
  imagen = constImagenProducto.imgprod_ruta_archivo;
  imagen = imagen.split("./public");
  imagen = imagen[1];
  imagen = process.env.BACK_LINK + imagen;
} else {
  imagen =
    "http://wws.com.pa/wp-content/plugins/wordpress-ecommerce/marketpress-includes/images/default-product.png";
}

var fecha_temp = date_and_time.format(
  constCotizacionesProductos[x].dataValues.cotp_fecha_entrega,
  "YYYY/MM/DD"
);

//Para hacer tabla de productos y envios
if (fecha_actual == fecha_temp) {
  // console.log(
  //   constCotizacionesProductos[x].dataValues.cotp_prod_producto_id
  // );

  htmlBody +=
    `
                <div style='color: #444444; vertical-align: top; font-weight: 400; padding: 5px;'>
                  <div style='width: 15%; display: inline-block; vertical-align: top;'>
                    <img src='` +
    imagen +
    `' style='width: 100%;' />
                  </div>
                  <div style='display: inline-block; width: 70%; margin-left: 5%;'>
                    <p style='font-size: 18px; line-height: 16px; text-align: justify; margin-top: 0px; margin-bottom: 10px;'>` +
    prod_nombre +
    `</p>
                    <p style='font-size: 18px; line-height: 16px; text-align: justify; margin-top: 0px; margin-bottom: 10px;'>[` +
    prod_nombre_foraneo +
    `]</p>
                    <p style='font-size: 18px; line-height: 16px; text-align: justify; margin-top: 0px; margin-bottom: 10px;'>` +
    cantidad +
    ` piezas</p>
                    <p style='font-size: 18px; line-height: 16px; text-align: justify; margin-top: 0px; margin-bottom: 10px;'>` +
    precio +
    `</p>
                  </div>
                </div>
          `;
} else {
  fecha_actual = fecha_temp;

  if (x != 0) {
    htmlBody += `<hr>`;
  }

  if (isRecoleccion == true) {
    htmlBody += `<p>Recolectar para el dia ` + fecha_actual + `</p>`;
  } else {
    htmlBody += `<p>Enviando para el ` + fecha_actual + `</p>`;
  }

  htmlBody +=
    `
            <div style='color: #444444; vertical-align: top; font-weight: 400; padding: 5px;'>
              <div style='width: 15%; display: inline-block; vertical-align: top;'>
                <img src='` +
    imagen +
    `' style='width: 200px; height:200px;' />
              </div>
              <div style='display: inline-block; width: 70%; margin-left: 5%;'>
                <p style='font-size: 18px; line-height: 16px; text-align: justify; margin-top: 0px; margin-bottom: 10px;'>` +
    prod_nombre +
    `</p>
                <p style='font-size: 18px; line-height: 16px; text-align: justify; margin-top: 0px; margin-bottom: 10px;'>[` +
    prod_nombre_foraneo +
    `]</p>
                <p style='font-size: 18px; line-height: 16px; text-align: justify; margin-top: 0px; margin-bottom: 10px;'>` +
    cantidad +
    ` piezas</p>
                <p style='font-size: 18px; line-height: 16px; text-align: justify; margin-top: 0px; margin-bottom: 10px;'>` +
    precio +
    `</p>
              </div>
            </div>
          `;
}
}
htmlBody +=
`</div>
                      </div>


                    <div style="max-width: 375px;" align="center">  
                      <div  class='datos' style="background-color: #f5f5f5;">
    
                        <table style="width: 100%; padding: 0px 15px;">
                          <tbody>
                            <tr>
                              <td style="text-align: left;">
                                <div style='color: #000000; font-size: 18px; font-weight: 600; letter-spacing: 0; line-height: 20px;'>
                                  <div class='contenidos'>
                                  </div>
                                    <p>Subtotal</p>
                                  </div>
                              </td>
                              <td style="text-align: right;">
                                <div style='color: #000000; font-size: 16px; letter-spacing: 0; line-height: 20px;'>
                                  <div class='contenido1'>
                                  </div>
                                        <p>${subTotal}</p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                          
                      <div style="max-width: 100%;" align="center">
                        <p style="font-size: 14px; margin-top: 25px; margin-bottom: 40px; padding: 0px 15px; text-align: justify;">Recuerda atender a la brevedad las cotizaciones incrementa las probabilidades de cerrar una venta.</p>
                        <div styel='width:100%; text-align:center;'>
                           <a href="`+ process.env.STORE_LINK +`/myprofile" style="font-size: 14px; text-decoration:  none; color: #FFFFFF; background-color: #0B3196; padding: 10px 25px;  border-radius:5px ;"> Ir a cotización </a>
                        </div>
                      </div>
                      
                    </div>  

                </section>

                


                    </article> <!-- /article -->
                  
                  </section>
                </section> <!-- / #main-content -->

                <footer style='flex: 1; '>
                <div align="center">
    
                        <div style='padding-top: 1rem; min-width: 12.5rem;'>
                          <section class='ft-legal'>
                            <center>&copy; 2022 Dielsa. Todos Los Derechos Reservados.</center>
                          </section>
                        </div>                                
            
                </div>
              </footer>

                  
                </body>
                </html>

      `;

      // console.log(htmlBody)

    // Definimos list email test
    var maillist
    if(process.env.EMAIL_ENV == "development")
    {
        maillist = [
            // "baltazar.ibarra@dielsa.com",
            // "gustavo.arizpe@dielsa.com",
             "marlen.pena@dielsa.com",
            // "gabriel@puntocommerce.com",
           // "henry@puntocommerce.com",
            // "aymara@puntocommerce.com",
           // "alfredo@puntocommerce.com",
            "informatica@dielsa.com",
            "oscar.espinosa@daltum.mx",
            "luis.sanchez@daltum.mx",email
        ];
    }
    else
    {
        maillist = [
            "ov@dielsa.com",
            email
        ];
    }

    
    // Definimos el email
    const mailOptions = {
      from: "no-responder@dielsa.com",
      to: maillist,
      // to: constSociosNegocio.sn_email_facturacion,
      subject: "Nueva Cotizacion Dielsa.com v2",
      html: htmlBody,
    };
    // Enviamos el email
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("GOOD JOB", data);
      }
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};