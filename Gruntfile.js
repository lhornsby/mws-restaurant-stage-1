/*
Process Commands:
  "grunt" - new, completed images directory, full process
  "grunt clean" - removes the images directory & contents
  "grunt responsive_images" - re-processes images, leave old ones
*/

module.exports = function(grunt) {

  grunt.initConfig({
    responsive_images: {
      dev: {
        options: {
          engine: 'im',
          sizes: [
            {
              name: "small",
              width: 400,
              quality: 60
            },
            {
              name: "medium",
              width: 600,
              quality: 60
            },
          ]
        },

        files: [{
          expand: true,
          src: ['*.{gif,jpg,png}'],
          cwd: 'img/',
          dest: 'images_sized/'
        }]
      }
    },

    //Nuke the image directory
    clean: {
      dev: {
        src: ['images_sized'],
      },
    },

    //Make image directory in case its removed
    mkdir: {
      dev: {
        options: {
          create: ['images_sized']
        },
      },
    },

  });

  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.registerTask('default', ['clean', 'mkdir', 'responsive_images']);
};
