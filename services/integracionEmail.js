
const nodemailer = require("nodemailer");

import { Sequelize } from "sequelize";
const sequelize = new Sequelize(process.env.POSTGRESQL);




// exports.creadaOrden = async function(email, id_usuario_socio, orden){
exports.integracionEmail = async function (cadena ) {
  try {
   
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


    var htmlBody =cadena

      // console.log(htmlBody)

    // Definimos list email test
    var maillist
    if(process.env.EMAIL_ENV == "development")
    {
        maillist = [
            "informatica@dielsa.com",
            "oscar.espinosa@daltum.mx",
            "luis.sanchez@daltum.mx",
            "baltazar.ibarra@dielsa.com",
           "gustavo.arizpe@dielsa.com",
           "marlen.pena@dielsa.com"
         
        ];
    }
    else
    {
        maillist = [
            //"ov@dielsa.com"
            "informatica@dielsa.com"
            //email
        ];
    }

    
    // Definimos el email
    const mailOptions = {
      from: "no-responder@dielsa.com",
      to: maillist,
      // to: constSociosNegocio.sn_email_facturacion,
      subject: "Integraciones",
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