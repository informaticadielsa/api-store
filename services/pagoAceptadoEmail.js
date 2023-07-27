const nodemailer = require("nodemailer");
import models from "../models";
const { Op } = require("sequelize");
import { Sequelize } from "sequelize";
const sequelize = new Sequelize(process.env.POSTGRESQL);
import date_and_time from "date-and-time";
import getCheckout from "../services/checkoutAPI";
const sortJSON = function (data, key, orden) {
  return data.sort(function (a, b) {
    var x = a[key],
      y = b[key];

    if (orden === "asc") {
      return x < y ? -1 : x > y ? 1 : 0;
    }

    if (orden === "desc") {
      return x > y ? -1 : x < y ? 1 : 0;
    }
  });
};
exports.pagoAceptado = async function (
  email,
  id_usuario_socio,
  orden,
  checkout
) {
  try {
    //Compra Finalizada order information
    // const constCompraFinalizada = await models.CompraFinalizada.findOne({
    //   where: {
    //     cf_compra_numero_orden: orden,
    //   },
    // });

    //Compra Finalizada order information
    // const constCompraFinalizada = await models.CompraFinalizada.findOne({
    //   where: {
    //     cf_compra_numero_orden: orden,
    //   },
    // });

    // console.log(constCompraFinalizada)

    console.log(888888888)
    console.log(checkout.dataValues.cdc_sn_socio_de_negocio_id);

    //-----------------------------------------------------------------
    // Datos personales
    //Compra Finalizada order information
    const constSociosNegocio = await models.SociosNegocio.findOne({
      where: {
        sn_socios_negocio_id: checkout.dataValues.cdc_sn_socio_de_negocio_id,
      },
    });

    var razon_social = constSociosNegocio.sn_razon_social;
    var correo_facturacion = constSociosNegocio.sn_email_facturacion;
    var cardcode = constSociosNegocio.sn_cardcode;

    //-----------------------------------------------------------------
    // Datos de entrega
    var estadoValor;
    var estadoCodigo;
    var paisValor;
    var direccion;
    var direccionEnvio;
    var colonia;
    var ciudad;
    var codigo_postal;

    //obtener tipo de envio
    const constControlMaestroMultipleTipoEnvio =
      await models.ControlMaestroMultiple.findOne({
        where: {
          cmm_control_id: checkout.dataValues.cdc_cmm_tipo_envio_id,
        },
      });

    var isRecoleccion = false;

    if (constControlMaestroMultipleTipoEnvio.cmm_valor == "Recolección") {
      isRecoleccion = true;

      //Buscar direccion de recoleccion
      const constAlmaceness = await models.Almacenes.findOne({
        where: {
          alm_almacen_id: checkout.dataValues.cdc_alm_almacen_recoleccion,
        },
      });

      //Buscar direccion de envio
      const constRawAlmacenes = await models.RawAlmacenes.findOne({
        where: {
          codigoAlmacen: constAlmaceness.alm_codigoAlmacen,
        },
      });

      const constEstado = await models.Estado.findOne({
        where: {
          estpa_codigo_estado: constRawAlmacenes.estado,
        },
      });

      if (constEstado) {
        estadoValor = constEstado.dataValues.estpa_estado_nombre;
        estadoCodigo = constEstado.dataValues.estpa_codigo_estado;
      }

      const constPais = await models.Pais.findOne({
        where: {
          pais_abreviatura: constRawAlmacenes.pais,
        },
      });

      if (constPais) {
        paisValor = constPais.dataValues.pais_nombre;
      }

      // Set direccion de envio
      direccion = constRawAlmacenes.calle;

      colonia = "Col. " + constRawAlmacenes.colonia;

      ciudad = constRawAlmacenes.ciudad;

      codigo_postal = "Cp. " + constRawAlmacenes.codigoPostal;
    } else {
      //Generar Direccin de envio
      if (checkout.dataValues.cdc_direccion_envio_id) {
        //Buscar direccion de envio
        const constSociosNegocioDirecciones =
          await models.SociosNegocioDirecciones.findOne({
            where: {
              snd_direcciones_id: checkout.dataValues.cdc_direccion_envio_id,
            },
          });

        //Si existe el estado ID
        if (constSociosNegocioDirecciones.snd_estado_id) {
          const constEstado = await models.Estado.findOne({
            where: {
              estpa_estado_pais_id: constSociosNegocioDirecciones.snd_estado_id,
            },
          });

          if (constEstado) {
            estadoValor = constEstado.dataValues.estpa_estado_nombre;
            estadoCodigo = constEstado.dataValues.estpa_codigo_estado;
          }
        }

        //Si existe el pais ID
        if (constSociosNegocioDirecciones.snd_pais_id) {
          const constPais = await models.Pais.findOne({
            where: {
              pais_pais_id: constSociosNegocioDirecciones.snd_pais_id,
            },
          });

          if (constPais) {
            paisValor = constPais.dataValues.pais_nombre;
          }
        }

        // Set direccion de envio
        var constDireccionEnvio = constSociosNegocioDirecciones.dataValues;

        direccion = constDireccionEnvio.snd_direccion;

        if (constDireccionEnvio.snd_colonia) {
          colonia = "Col. " + constDireccionEnvio.snd_colonia;
        }

        if (constDireccionEnvio.snd_ciudad) {
          ciudad = constDireccionEnvio.snd_ciudad;
        }

        if (constDireccionEnvio.snd_codigo_postal) {
          codigo_postal = "Cp. " + constDireccionEnvio.snd_codigo_postal;
        }
      }
    }

    //-----------------------------------------------------------------

    //Metodo de pago
    var metodo_de_pago;
    if (checkout.dataValues.cdc_forma_pago_codigo == "99") {
      metodo_de_pago = "Mi Credito Con Dielsa";
    } else if (checkout.dataValues.cdc_forma_pago_codigo == "05") {
      metodo_de_pago = "Transferencia Bancaria";
    } else if (checkout.dataValues.cdc_forma_pago_codigo == "04") {
      metodo_de_pago = "Tarjeta De Crédito";
    } else if (checkout.dataValues.cdc_forma_pago_codigo == "28") {
      metodo_de_pago = "Tarjeta De Débito";
    }

    var totalCompra = checkout.dataValues.TotalFinal;

    var formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });

    totalCompra = formatter.format(totalCompra);

    //-----------------------------------------------------------------
    //Informacion final de pago

    var subTotal = checkout.dataValues.precioTotal;
    var orderIVA = checkout.dataValues.TotalImpuesto;
    var costoEnvio = parseFloat(checkout.dataValues.cdc_costo_envio.toFixed(2));
    var descuentos = checkout.dataValues.totalDescuentos;

    subTotal = formatter.format(subTotal);
    orderIVA = formatter.format(orderIVA);
    costoEnvio = formatter.format(costoEnvio);
    descuentos = formatter.format(descuentos);
    //-----------------------------------------------------------------

    const pedido = await models.CarritoDeCompra.findOne({
      where: {
        cdc_numero_orden: orden,
      },
    });
    const socios_negocio_usuario = await models.SociosNegocioUsuario.findOne({
      where: {
        snu_usuario_snu_id: id_usuario_socio,
      },
    });
    var SociosNegocioUsuarioEmail = socios_negocio_usuario.snu_correo_electronico

    const socio_negocio = await models.SociosNegocio.findOne({
      where: {
        sn_socios_negocio_id: socios_negocio_usuario.dataValues.snu_sn_socio_de_negocio_id,
      },
    });

    var SocioNegocioEmailFacturacion = socio_negocio.sn_email_facturacion

    let datos_comprador = "";
    datos_comprador +=
      " " +
      socios_negocio_usuario.dataValues.snu_nombre +
      " " +
      socios_negocio_usuario.dataValues.snu_primer_apellido +
      "<br>";
    datos_comprador += email + "<br>";
    datos_comprador += !!socios_negocio_usuario.dataValues.snu_telefono
      ? socios_negocio_usuario.dataValues.snu_telefono
      : " ";

    let direccion_de_envio = "";
    direccion_de_envio += "Dirección predeterminada" + " <br>";

    const total_compra = await sequelize.query(
      `
  select 
      sum(total.total)
  from(
  select 
      case 
          when pcdc.pcdc_mejor_descuento >= 10 then   (pcdc.pcdc_precio - (pcdc.pcdc_precio * cast(concat('0.' || pcdc.pcdc_mejor_descuento) as float))) * pcdc.pcdc_producto_cantidad
          when pcdc.pcdc_mejor_descuento <= 9 then    (pcdc.pcdc_precio - (pcdc.pcdc_precio * cast(concat('0.0' || pcdc.pcdc_mejor_descuento) as float))) * pcdc.pcdc_producto_cantidad
      end as total
  from carrito_de_compras cdc  
  left join productos_carrito_de_compra pcdc  on pcdc.pcdc_carrito_de_compra_id  = cdc.cdc_carrito_de_compra_id 
  where cdc.cdc_carrito_de_compra_id  = ` +
        pedido.dataValues.cdc_carrito_de_compra_id +
        `
  )total
  `,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    let total_de_la_compra = total_compra.length > 0 ? total_compra[0].sum : 0;

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

    // Definimos el email
    var htmlBody =
      `
<!DOCTYPE html>
<html lang='es'>
<head>
<title>Pago aceptado</title>
<link href="` +
      process.env.BACK_LINK +
      `/recursos/bootstrap.min.css" rel="stylesheet">
<style type="text/css">
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
<body>
<header class="header_logo">
  <img src='` +
      process.env.BACK_LINK +
      `/recursos/logo.png' / style='max-height: 70px; margin-top: 10px; margin: auto'>
</header>

    <section style='background: white; width: 90%; max-width: 800px; margin: 20px auto; text-align: -webkit-center; margin-top: 50px;'>
      <section id='main-content'>
        <header>
          <div style='color: #0B3196; font-size: 28px; font-weight: 500; letter-spacing: 0;'>
            <h1>Tu pago ha sido confirmado</h1>                  
          </div>
        </header>

        <div style='padding-top: 20px; color: #000000; font-size: 18px; font-weight: 600; letter-spacing: 0; line-height: 20px; text-align: justify;'>
          <p>Estimado ` +
      razon_social +
      `.</p>
        </div>
        
        <div style='color: #000000; font-size: 16px; letter-spacing: 0; line-height: 20px; text-align: -webkit-left'>
          <p>¡Gracias por comprar con nosotros!</p>
          <p>El pago de tu pedido #` +
      orden +
      ` fue generado exitosamente.</p>
          <p>Puedes comprobar el estado de tu pedido en la sección de mis ordenes.</p>
          <p>Gracias por tu preferencia.</p>
        </div>
      </section>
    
      <section class='datos' style='background: #F5F5F5; padding: 20px;'>  
        <div style='color: #000000; font-size: 18px; font-weight: 600; letter-spacing: 0; line-height: 20px; text-align: justify;'>
          <p>Datos Personales</p>
        </div>
        <div style='color: #000000; font-size: 16px; letter-spacing: 0; line-height: 20px; text-align: -webkit-left'>
          <p>` +
      razon_social +
      `</p>
                      <p>` +
      correo_facturacion +
      `</p>
                      <p>` +
      cardcode +
      `</p>
        </div>
        <div style='color: #000000; font-size: 18px; font-weight: 600; letter-spacing: 0; line-height: 20px; text-align: justify;'>`;
    if (isRecoleccion == true) {
      htmlBody += `
                                <p>Dirección de recolección</p>
                              `;
    } else {
      htmlBody += `
                                <p>Dirección de entrega</p>
                              `;
    }

    htmlBody +=
      `
        </div>
        <div style='color: #000000; font-size: 16px; letter-spacing: 0; line-height: 20px; text-align: -webkit-left'>
          <p>` +
      direccion +
      `</p>
                                <p>` +
      colonia +
      `</p>
                                <p>` +
      ciudad +
      `</p>
                                <p>` +
      codigo_postal +
      `</p>
        </div>
        <div style='color: #000000; font-size: 18px; font-weight: 600; letter-spacing: 0; line-height: 20px; text-align: justify;'>
          <p>Método de pago</p>
        </div>
        <div style='color: #000000; font-size: 16px; letter-spacing: 0; line-height: 20px; text-align: -webkit-left'>
          <p>` +
      metodo_de_pago +
      `</p>
          <p>Por la cantidad de ` +
      totalCompra +
      `</p>
        </div>
      </section>
    
      <section class='datos1' style='padding: 10px'>
        <div style='color: #fff; font-size: 18px; font-weight: 600; letter-spacing: 0; line-height: 20px; text-align: center;'>
          <p> <a style='text-decoration: none; color: #0B3196 !important;' href='` +
      process.env.FRONT_B2B +
      `/myprofile?orderid=` +
      pedido.dataValues.cf_compra_finalizada_id +
      `'>Detalles de compra</a></p>
        </div>
      </section>

      <section class='datos' style='background: #F5F5F5; padding: 20px;'>
      <div style='padding-right: 15px; padding-bottom: 15px;'>
                        <div style='color: #0B3196; font-size: 18px; font-weight: 600; letter-spacing: 0; line-height: 20px; text-align: justify; margin-bottom: 20px'>
                        `;

    // const constProductoCarritoDeCompra = await models.ProductoCarritoDeCompra.findAll({
    //     where: {
    //       pcf_cf_compra_finalizada_id: orden,
    //     },
    //     order: [["pcf_fecha_entrega", "ASC"]]
    //     // attributes: [
    //     //   "pcf_prod_producto_id",
    //     //   "pcf_fecha_entrega",
    //     //   "pcf_cantidad_producto",
    //     //   "pcf_precio",
    //     //   "pcf_producto_compra_finalizada_id",
    //     //   "pcf_cantidad_entregada",
    //     // ],
    //   });

    console.log(11111111111);
    var lineasTemporales =
      await getCheckout.getLineasProductosComprasFinalizadas(checkout, 1);

    for (var i = 0; i < lineasTemporales.length; i++) {
      //Fecha de entrega informacion
      var dateFinal;
      var day = new Date();

      var defined = false;
      if (
        typeof lineasTemporales[i].pcf_recoleccion_resurtimiento !== "undefined"
      ) {
        defined = true;
      }

      if (defined == true) {
        console.log(1111111);
        var dayLetters = date_and_time.format(day, "dddd");

        var AddingsDays = 0;
        switch (dayLetters) {
          case "Monday":
            AddingsDays = 9;
            break;

          case "Tuesday":
            AddingsDays = 8;
            break;

          case "Wednesday":
            AddingsDays = 7;
            break;

          case "Thursday":
            AddingsDays = 6;
            break;

          case "Friday":
            AddingsDays = 5;
            break;

          case "Saturday":
            AddingsDays = 4;
            break;

          case "Sunday":
            AddingsDays = 3;
            break;
        }
        var nuevoDia = date_and_time.addDays(day, AddingsDays);
        nuevoDia = date_and_time.addHours(nuevoDia, -5);

        dateFinal = date_and_time.format(nuevoDia, "YYYY/MM/DD");
      } else if (lineasTemporales[i].pcf_dias_resurtimiento > 0) {
        console.log(22222);
        var nuevoDia = date_and_time.addDays(
          day,
          lineasTemporales[i].pcf_dias_resurtimiento + 1
        );
        nuevoDia = date_and_time.addHours(nuevoDia, -5);

        dateFinal = date_and_time.format(nuevoDia, "YYYY/MM/DD");
      } else if (
        checkout.dataValues.cdc_politica_envio_surtir_un_solo_almacen ==
          false &&
        checkout.dataValues.cdc_politica_envio_nombre != null
      ) {
        console.log(999999);
        var dayLetters = date_and_time.format(day, "dddd");

        var AddingsDays = 0;
        switch (dayLetters) {
          case "Monday":
            AddingsDays = 9;
            break;

          case "Tuesday":
            AddingsDays = 8;
            break;

          case "Wednesday":
            AddingsDays = 7;
            break;

          case "Thursday":
            AddingsDays = 13;
            break;

          case "Friday":
            AddingsDays = 12;
            break;

          case "Saturday":
            AddingsDays = 11;
            break;

          case "Sunday":
            AddingsDays = 10;
            break;
        }
        var nuevoDia = date_and_time.addDays(day, AddingsDays);
        nuevoDia = date_and_time.addHours(nuevoDia, -5);

        dateFinal = date_and_time.format(nuevoDia, "YYYY/MM/DD");
      } else {
        console.log(333333);
        var nuevoDia = date_and_time.addDays(day, 1);
        nuevoDia = date_and_time.addHours(nuevoDia, -5);

        dateFinal = date_and_time.format(nuevoDia, "YYYY/MM/DD");
      }

      lineasTemporales[i].dateFinal = dateFinal;
    }

    console.log(lineasTemporales);

    console.log(666555444);

    var principalTemp = sortJSON(lineasTemporales, "dateFinal", "asc");
    var fecha_actual;

    console.log(999888777);

    for (var x = 0; x < lineasTemporales.length; x++) {
      const constProducto = await models.Producto.findOne({
        where: {
          prod_producto_id: lineasTemporales[x].pcf_prod_producto_id,
        },
        attributes: ["prod_nombre", "prod_nombre_extranjero"],
      });

      const constImagenProducto = await models.ImagenProducto.findOne({
        where: {
          imgprod_prod_producto_id: lineasTemporales[x].pcf_prod_producto_id,
        },
        order: [["imgprod_nombre_archivo", "ASC"]],
      });

      console.log(44444444);
      var imagen;
      var prod_nombre = constProducto.prod_nombre;
      var prod_nombre_foraneo = constProducto.prod_nombre_extranjero;
      var cantidad = lineasTemporales[x].pcf_cantidad_entregada;
      var precio = lineasTemporales[x].pcf_precio;
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

      console.log(54321);
      var fecha_temp = dateFinal;
      console.log(12345);

      //Para hacer tabla de productos y envios
      if (fecha_actual == fecha_temp) {
        htmlBody += `<p>Entregado el ` + fecha_actual + `</p>`;

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
                                  <p style='font-size: 18px; line-height: 16px; text-align: justify; margin-top: 0px; margin-bottom: 10px;'>` +
          prod_nombre_foraneo +
          `</p>
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
          htmlBody += `<p>Recolectar para el día ` + fecha_actual + `</p>`;
        } else {
          htmlBody += `<p>Enviando para el ` + fecha_actual + `</p>`;
        }

        htmlBody +=
          ` <div style='color: #444444; vertical-align: top; font-weight: 400; padding: 5px;'>
              <div style='width: 15%; display: inline-block; vertical-align: top;'>
                <img src='` +
          imagen +
          `' style='width: 100%;' />
              </div>
              <div style='display: inline-block; width: 70%; margin-left: 5%;'>
                <p style='font-size: 18px; line-height: 16px; text-align: justify; margin-top: 0px; margin-bottom: 10px;'>` +
          prod_nombre +
          `</p>
                <p style='font-size: 18px; line-height: 16px; text-align: justify; margin-top: 0px; margin-bottom: 10px;'>` +
          prod_nombre_foraneo +
          `</p>
                <p style='font-size: 18px; line-height: 16px; text-align: justify; margin-top: 0px; margin-bottom: 10px;'>` +
          cantidad +
          `</p>
                <p style='font-size: 18px; line-height: 16px; text-align: justify; margin-top: 0px; margin-bottom: 10px;'>` +
          precio +
          `</p>
              </div>
            </div>`;
      }
    }

    htmlBody +=
      `   </div>
        </div>
        </section>
      
      <section class='datos' style='background: #F5F5F5; padding: 20px;'>
        <div style='color: #000000; font-size: 18px; font-weight: 600; letter-spacing: 0; line-height: 20px; text-align: justify;'>
          <p>Subtotal</p>
        </div>
        <div style='color: #000000; font-size: 16px; letter-spacing: 0; line-height: 20px; text-align: -webkit-left'>
          <p>` +
      subTotal +
      `</p>
        </div>
        <div style='color: #000000; font-size: 18px; font-weight: 600; letter-spacing: 0; line-height: 20px; text-align: justify;'>
          <p>Gastos de envío</p>
        </div>
        <div style='color: #000000; font-size: 16px; letter-spacing: 0; line-height: 20px; text-align: -webkit-left'>
          <p>` +
      costoEnvio +
      `</p>
        </div>
        <div style='color: #000000; font-size: 18px; font-weight: 600; letter-spacing: 0; line-height: 20px; text-align: justify;'>
          <p>Descuento</p>
        </div>
        <div style='color: #000000; font-size: 16px; letter-spacing: 0; line-height: 20px; text-align: -webkit-left'>
          <p>` +
      descuentos +
      `</p>
        </div>
        <div style='color: #000000; font-size: 18px; font-weight: 600; letter-spacing: 0; line-height: 20px; text-align: justify;'>
          <p>IVA 16%</p>
        </div>
        <div style='color: #000000; font-size: 16px; letter-spacing: 0; line-height: 20px; text-align: -webkit-left'>
          <p>$ ` +
      orderIVA +
      `</p>
        </div>
        <div style='color: #000000; font-size: 18px; font-weight: 600; letter-spacing: 0; line-height: 20px; text-align: justify;'>
          <p>Total</p>
        </div>
        <div style='color: #000000; font-size: 16px; letter-spacing: 0; line-height: 20px; text-align: -webkit-left'>
          <p>$ ` +
      totalCompra +
      `</p>
        </div>
      </section>

    </section>
    <footer style='flex: 1; padding-top: 50px; background: #0B3196;color: white;text-align: left;padding: 20px;margin-top: 40px;'>
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td>
              <table border="0" cellpadding="0" cellspacing="0" align="left" width="24%">
                  <tr>
                      <td>
                        <div style='padding: 0.5rem; min-width: 12.5rem;'>
                          <div class='ft-main-item'></div>                                    
                          <h2 class='ft-title' style='color: #FFFFFF; font-size: 16px; font-weight: 500; letter-spacing: 0; line-height: 16px;'>
                            ¿Necesita ayuda?
                          </h2>
                            <p style='color:white; font-size: 14px;'>(81) 8123 9359</p>                                            
                            <p style='color:white; font-size: 14px;'><a class='colores' href='mailto:contacto@dielsa.com' style='color:white; font-size: 14px; text-decoration: none;'>contacto@dielsa.com</a></p>                                            
                        </div>
                      </td>
                  </tr>                                  
              </table>
              <table border="0" cellpadding="0" cellspacing="0" align="left" width="24%">
                  <tr>
                      <td>
                        <div style='padding: 0.5rem; min-width: 12.5rem;'>
                          <div class='ft-main-item'></div>                                    
                          <h2 class='ft-title' style='color: #FFFFFF; font-size: 16px; font-weight: 500; letter-spacing: 0; line-height: 16px;'>
                            Dielsa Monterrey
                          </h2>
                          <p class='colores' style='color:white; font-size: 14px;'>Oscar Wilde No. 143 Col. San Jerónimo, <br>Monterrey, N.L. C.P. 64640 Tel. (81) 4739 36 08</p>
                        </div>                                    
                      </td>
                  </tr>                                  
              </table>
              <table border="0" cellpadding="0" cellspacing="0" align="left" width="24%">
                  <tr>
                      <td>
                        <div style='padding: 0.5rem; min-width: 12.5rem;'>
                          <div class='ft-main-item'></div>                                    
                          <h2 class='ft-title' style='color: #FFFFFF; font-size: 16px; font-weight: 500; letter-spacing: 0; line-height: 16px;'>
                            Dielsa Ciudad de México
                          </h2>
                          <p class='colores' style='color:white; font-size: 14px;'>Benito Juárez No. 19 Col. Lazaro Cardenas Estado <br>de México, Naucalpan de Juárez C.P. 53560 Tel. (55) 5353 3474</p>                                            
                        </div>                                                                             
                      </td>
                  </tr>                                  
              </table>
              <table border="0" cellpadding="0" cellspacing="0" align="left" width="24%">
                  <tr>
                      <td>
                        <div style='padding: 0.5rem; min-width: 12.5rem;'>
                          <div class='ft-main-item'></div>                                                                                
                          <div class='social'>
                                <a href='https://www.facebook.com/Dielsamsi/' style='text-decoration: none;' target="_blank">
                                    <img src="` +
      process.env.BACK_LINK +
      `/recursos/Facebook.png" alt='facebook'>
                                </a>
                                <a href='https://www.linkedin.com/company/dielsa-telecomunicaciones/' style='text-decoration: none;' target="_blank">
                                    <img src="` +
      process.env.BACK_LINK +
      `/recursos/LinkedIn.png" alt='linkedin'>
                                </a>
                                <a href='https://www.instagram.com/dielsamsi/?hl=es' style='text-decoration: none;' target="_blank">
                                    <img src="` +
      process.env.BACK_LINK +
      `/recursos/Instagram.png" alt='instagram'>
                                </a>
                                <a href='https://www.youtube.com/channel/UCLYgOWzTRXXuJvMIcvB4GLw' style='text-decoration: none;' target="_blank">
                                    <img src="` +
      process.env.BACK_LINK +
      `/recursos/Youtube.png" alt='youtube'>
                                </a>
                            </div>                                        
                        </div>                                                                             
                      </td>
                  </tr>                                  
              </table>
          </td>
        </tr>
        <tr> 
          <td>
            <div style='padding-top: 1rem; min-width: 12.5rem;'>
              <section class='ft-legal'>
                <center>&copy; 2022 Dielsa. Todos Los Derechos Reservados.</center>
              </section>
            </div>                                
          </td>
        </tr>
      </table>
    </footer>
  </body>    
</html>
    `;
    console.log(99999999999)

    // Definimos list email test
    var maillist
    if(process.env.EMAIL_ENV == "development")
    {
        maillist = [
           
            "informatica@dielsa.com",
            "oscar.espinosa@daltum.mx",
            "luis.sanchez@daltum.mx"
        ];
    }
    else
    {
        maillist = [
            "pagos@dielsa.com",
            SociosNegocioUsuarioEmail,
            correo_facturacion
        ];
    }



    // Definimos el email
    const mailOptions = {
      from: "no-responder@dielsa.com",
      to: maillist,
      subject: "Pago aceptado",
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
