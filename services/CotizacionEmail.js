const nodemailer = require("nodemailer");
const { default: models } = require("../models");

import { Sequelize } from "sequelize";
const sequelize = new Sequelize(process.env.POSTGRESQL);
exports.cotizacionEmail = async function (email, cot_cotizacion_id) {
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

 
 console.log('prueba cotiza')
  const cotizacion = await models.Cotizaciones.findOne({
    where: {
      cot_cotizacion_id: cot_cotizacion_id,
    },
  });
  console.log('cotizacion:', cotizacion)
  if (!!cotizacion) {

    let html = "hola prueba";
    let total;
    let descuento;
    let total_con_descuento;
    console.log('cotizacion correo enviar', cotizacion )
    const constCotizacionesProductos = await models.CotizacionesProductos.findAll(
      {
          where: {
              cotp_cotizacion_id:cot_cotizacion_id
          },
      });
  //fin Ge
   console.log('Cotizacion detalle:', constCotizacionesProductos)

    var htmlBody =
      "<!DOCTYPE html> " +
      "<html>  " +
      "    <head> " +
      '        <style type="text/css">' +
      '            @import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");' +
      "            body { " +
      "                color: #333; " +
      '                font-family: "Montserrat", sans-serif; ' +
      "                margin: 0px; " +
      "                font-size: 16px; " +
      "            } " +
      "            .pie { " +
      "                font-size:12px;" +
      "                text-align: center;" +
      "                font-weight: 300;" +
      '                font-family: "Montserrat", sans-serif; ' +
      "                color:#999797; " +
      "            }" +
      "            h3{" +
      '                font-family: "Monserrat", sans-serif;' +
      "                font-weight: 900;" +
      "                font-size: 20px;" +
      "                text-align: center;" +
      "            }" +
      "            img{" +
      "                display:block;" +
      "                margin:auto;" +
      "            }" +
      "            .centro {" +
      '                font-family: "Montserrat", sans-serif;' +
      "                font-weight: 500;" +
      "                font-size:16px; " +
      "            }" +
      "            a{" +
      "                text-align: center;" +
      "                display: block;" +
      "                width: auto;" +
      "                height: auto;" +
      "                line-height: 40px;" +
      "                font-size: 15px;" +
      '                font-family: "Monserrat", sans-serif;' +
      "                text-decoration: none;" +
      "                color: #f47a62;" +
      "                border: 2px solid  #f47a62;" +
      "                letter-spacing: 2px;" +
      "                text-align: center;" +
      "                position: relative;" +
      "                transition: all .35s;" +
      "            }" +
      "            a span{" +
      "                position: relative;" +
      "                z-index: 2;" +
      "            }" +
      "            a:after{" +
      "                position: absolute;" +
      '                content: "";' +
      "                top: 0;" +
      "                left: 0;" +
      "                width: 0;" +
      "                height: 100%;" +
      "                background:  #f47a62;" +
      "                transition: all .35s;" +
      "                color: #fff;" +
      "            }" +
      "            " +
      "        </style> " +
      "        <title>Recuperaci&oacute;n de contrase&ntilde;a</title>" +
      "    </head> " +
      "    <body> " +
      '        <table width="593" height="324" border="0" align="center"> ' +
      "            <tr> " +
      "                <td>&nbsp;</td> " +
      "            </tr> " +
      "            <tr> " +
      '                <td height="88"  colspan="3">' +
      '                <img src="https://puntocommerce.com/images/logo_nuevo.png" width="115" height="70"/>' +
      '                <img src="https://puntocommerce.com/images/logolet_nuevo.png" width="250" height="90" />' +
      "                </td> " +
      "            </tr> " +
      "            <tr> " +
      '                <td height="97" valign="top" class="centro" colspan="3">' +
      '                    <h3 style="width: 100%;">Cotizaci&oacute;n [Reporte]</h3> ' +
      "                </td> " +
      "            </tr> " +
      "            <tr> " +
      '<table width="100%" border="1px" class="centro">' +
      "<tr>" +
      "<th><strong>N&uacute;mero de art&iacute;culo</strong></th>" +
      "<th><strong>Imagen</strong></th>" +
      "<th><strong>Descripci&oacute;n del art&iacute;culo</strong></th>" +
      "<th><strong>Cantidad</strong></th>" +
      "<th><strong>Precio cotizaci&oacute;n</strong></th>" +
      "<th><strong>Precio p&uacute;blico</strong></th>" +
      "<th><strong>Descuento</strong></th>" +
      "<th><strong>Total sin descuento</strong></th>" +
      "<th><strong>Total con descuento</strong></th>" +
      "</tr>" +
      html +
      "</table>" +
      "            </tr> " +
      "            <tr> " +
      '                <td height="17" ></td> ' +
      "            </tr> " +
      "            <tr> " +
      '                <td height="27" class="pie">No responda este correo.</td> ' +
      "            </tr> " +
      "        </table> " +
      "    </body> " +
      "</html>";

    // Definimos list email test
    var maillist = [
      "informatica@dielsa.com",
      "oscar.espinosa@daltum.mx",
      email
    ];

    console.log('enviar correo', maillist)
    // Definimos el email
    const mailOptions = {
      from: "no-responder@dielsa.com",
      to: maillist,
      // to: email,
      // to: constSociosNegocio.sn_email_facturacion,
      subject:
        "Cotización",
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

    return true;
  } else {
    return false;
  }
};
