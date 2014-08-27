require('./console')

var bodies = [{"name":"Ferux","collection":"Ferux","position":[170,180],"radius":14,"options":{"fill":"ff5151"},"_id":"1806ae1a-b9e2-4496-99db-f56edc66f194","description":"The closest body to Helion"},{"name":"a","collection":"Ferux","position":[205,212],"radius":3,"options":{"fill":"ff5151"},"_id":"587fc0d0-7c4f-4ccf-8f79-e2fae663c5b5"},{"name":"Alkon","collection":"Alkon","position":[321,366],"radius":25,"options":{"fill":"4ca6ff"},"_id":"6b70cb2d-8c1d-4321-8ed1-f9c6fa3c0ff8"},{"name":"Zola","collection":"Alkon","position":[361,272],"radius":16,"options":{"fill":"4ca6ff"},"_id":"d00d3667-d7a4-454d-b2ad-c6530e61e5ee","description":""},{"name":"b","collection":"Alkon","position":[264,418],"radius":6,"options":{"fill":"4ca6ff"},"_id":"9c49c918-9a80-4a59-8f5f-f14dc79ce0f1"},{"name":"c","collection":"Alkon","position":[236,374],"radius":4,"options":{"fill":"4ca6ff"},"_id":"2378dc43-4460-49d5-9828-f386bcb64468"},{"name":"Prime","collection":"Prime","position":[452,209],"radius":34,"options":{"fill":"1fff8f","stroke":"33ffff"},"description":"Eris's sister; it's ecosystem was ravaged by elemental and fuel mining. With Eris as a refuge, corporations had little interest in preserving any future for the planet.\n\nPrime sits derelict, its toxic environment prohibits access to most regions. A majority of the Inner's illegal operations operate among Prime's slient ruins.","_id":"79af8be2-bbda-4921-9fae-b4025803dab0"},{"name":"Eris","collection":"Eris","position":[600,173],"radius":32,"options":{"fill":"1aff1a","stroke":"33ffff"},"description":"Home to Cronus, the first Human colony in the Helion System. Intense regulations preserved the planet's fragile ecosystem during development and expansion and drove non-conformists capitalists to Prime where laws were harder to enforce.\n\nEris stands as the pride of the system, an efficient and integrated culture that thrives within the grasp of the environment.\n\nEcSys developments sprinkle the pristine landscape, with multiple high-traffic, sea-based spaceports.","_id":"63f8f2df-7623-4d06-b792-f03c0ced6f9e","culture":"Eris promotes fine arts and environmental innovation.","military":"Testing military"},{"name":"Maria","collection":"Eris","position":[567,260],"radius":11,"options":{"fill":"1aff1a"},"description":"Maria operates as a staging environment for porting new developments and technology onto Eris.\n\nAccess is highly restricted.","_id":"3666e155-c1a3-4649-828e-227a3778c4bd"},{"name":"Jorah","collection":"Eris","position":[688,205],"radius":7,"options":{"fill":"1aff1a"},"_id":"6296841c-c25e-444a-92a9-d74f79028c70","description":"Testing content creation"},{"name":"Mir","collection":"Mir","position":[897,449],"radius":76,"options":{"fill":"ff8000"},"description":"A gas giant that was settled long after the other planets of the system. It's hostile environment and lack of a surface were unbroken barriers until the final epoch.\n\nFuel is the main export from the planet and the few terrestrial settlements are financed by fuel industry.","_id":"6ef74810-81a3-4011-ad25-787fec0ec986"},{"name":"Krasic","collection":"Mir","position":[697,466],"radius":24,"options":{"fill":"ff8000"},"description":"A staging base for Jorah, is completely developed and industrialized. The natural environment has be purged from the moon, and it operates as a perfectly closed system. All energy is derived from tidal warping.\n\nInterstellar spaceport","_id":"726d0df8-979f-495b-b2a2-d962f483a24a"},{"name":"Aqx","collection":"Mir","position":[832,352],"radius":14,"options":{"fill":"ff8000","stroke":"33ffff"},"description":"Terraformed in the second epoch by a small group of wealthy investors, Aqx boasts an absolutely controlled and monitored ecosystem.\n\nIt is now home to the Guild, a powerful and influencing capitalist colony.\n\nAverage income on Aqx is 1000x the system average making it home to some of the wealthiest  people in Helion.","_id":"bedad8f5-ffdd-4d81-8741-a85a73d5a2be"},{"name":"Rome","collection":"Rome","position":[1220,260],"radius":25,"options":{"fill":"b100b1"},"_id":"78bf4633-c3f8-4bc4-b607-7897ca0ee606","description":"Rome and Deonix are the hub of the Outside, supplying raw materials and manufactured goods to the majority of the Outside settlements. \n\nThe Outside Guard is based out of Rome, making it the most militarily effective body in the system."},{"name":"Kassel","collection":"Rome","position":[1250,325],"radius":25,"options":{"fill":"b100b1"},"_id":"4bd1fdb2-fd1a-419f-b900-a6d82fe5c6c0"},{"name":"Earth","collection":"Earth","position":[500,1180],"radius":140,"options":{"fill":"00CC00"},"_id":"b5019602-b157-4b31-89b1-c1a2f997a5ab"}];

setTimeout(function() {
  bodies.forEach(function(body) {
    Body.findOne({ name: body.name }).update({
      $set: { 
        copy: {
          description: body.description,
          culture: body.culture,
          military: body.military
        }
      }
    }, function(err, res) {
      if (res)
        console.log('saved:', body.name);
    })
  });
}, 1500);