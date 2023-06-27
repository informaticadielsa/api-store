const nodemailer = require('nodemailer');
exports.testEmail = function(email, html){
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
      tls: { ciphers: 'SSLv3' },
      requiresAuth: true,
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      //maxConnections: 10,
      debug: true
    });


    
  // Definimos el email
  const mailOptions = {
    from: "no-responder@dielsa.com",
    to: email,
    subject: 'TEST HTML',
    html: html
  };


  // Enviamos el email
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
        console.log('Error', err);
    } else {
        console.log('GOOD JOB', data);
    }
  });
};