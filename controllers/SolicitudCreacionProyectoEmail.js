const nodemailer = require("nodemailer");
import models from "../models";
const { Op } = require("sequelize");
import { Sequelize } from "sequelize";
const sequelize = new Sequelize(process.env.POSTGRESQL);
import date_and_time from "date-and-time";

exports.solicitudCreacionProyectoEmail = async (mail, dataSocioNegocio, dataReceived, cardcode) => {
  try {
    var htmlBody =
      `
    <!DOCTYPE html>
      <html lang='es'>
      <head>
        <title>Pago aceptado</title>
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
      <body style="max-width:800px">
        <header class="header_logo">
            <img src='` +
      process.env.BACK_LINK +
      `/recursos/logo.png' / style='max-height: 70px; margin-top: 10px; margin: auto'>          
        </header>

        <article>
          <header>
            <div style='color: #0B3196; font-size: 28px; font-weight: 500; letter-spacing: 0; display: flex; justify-content: center;'>
              <h1>Solicitud de creación de proyecto</h1>                
            </div>
            <div style='color: #000000; font-size: 16px; letter-spacing: 0; line-height: 20px; text-align: -webkit-left'>
              <p>Socio de Negocio: ${dataReceived.cardcodeSocioNegocio}</p>
              <p>Contacto: ${dataReceived.contacto}</p>
              <p>Correo: ${dataReceived.correo}</p>
              <p>Ciudad: ${dataReceived.ciudad}</p>
              <p>Usuario final: ${dataReceived.usuario_final}</p>
            </div>
          </header>
        </article>
        
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

    const constSocioNegocioSap = await models.SociosNegocio.findOne({where:{sn_cardcode:cardcode}})
      


    const constUsuarioVendedor = await models.Usuario.findOne({
      where: {
        usu_codigo_vendedor: constSocioNegocioSap.sn_vendedor_codigo_sap,
      },
    });

    let vendedorAsignado =''
    let correoVendedorAsignado=''
    if(constUsuarioVendedor)
    {
      vendedorAsignado = constUsuarioVendedor.usu_nombre //+ " " + constUsuarioVendedor.usu_primer_apellido + " " + (constUsuarioVendedor.usu_segundo_apellido!= null ? constUsuarioVendedor.usu_segundo_apellido :'')
      correoVendedorAsignado =  constUsuarioVendedor.usu_correo_electronico
    }


    var maillist;
    if (process.env.EMAIL_ENV == "development") {
      maillist = [
        "informatica@dielsa.com",
        "oscar.espinosa@daltum.mx",
        "luis.sanchez@daltum.mx",
        mail === null ? "" : mail,
        correoVendedorAsignado != '' ? correoVendedorAsignado : ""
      ];
    } else {
      maillist = ["ov@dielsa.com", correoVendedorAsignado != '' ? correoVendedorAsignado : "", mail === null ? "" : mail];
    }

    const mailOptions = {
      from: "no-responder@dielsa.com",
      to: maillist,
      // to: constSociosNegocio.sn_email_facturacion,
      subject: "Solicitud de creacion de Proyecto Dielsa.com",
      html: htmlBody
    };

    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER, // correo gmail temporal
        pass: process.env.EMAIL_PASSWORD // Contraseña de aplicacion de google
      },
      // ignoreTLS: true,
      // secure: true,
      secureConnection: true,
      tls: { ciphers: "SSLv3" },
      requiresAuth: true,
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      //maxConnections: 10,
      debug: true
    });

    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("GOOD JOB", data);
      }
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
