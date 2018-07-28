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
            {
              name: "large",
              width: 800,
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

    //Minify the IDB promis js file
    uglify: {
      options: {
       mangle: false
     },
      my_target: {
        files: {
        //  'js/idb.min.js': ['js/idb.js'],
          'js/vendors.min.js': ['js/idb.js', 'js/lazysizes.min.js', 'ls.unveilhooks.min.js'],
        }
      }
    },
    critical: {
        test: {
            options: {
                base: './',
                css: [
                    'css/styles.css',
                ],
            },
            src: 'index.html',
            dest: 'css/critical.css'
        }
    },
  });

  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-critical');
  grunt.registerTask('default', ['clean', 'mkdir', 'responsive_images']);
};
