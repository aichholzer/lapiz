'use strict';


var exec = require('child_process').exec,
    Canvas = require('canvas'),
    lapiz = {

        /**
         * This is our grid, use to be drawn onto the history.
         *
         * @rows: Not currently in used, since the font size takes care of the height.
         * @cols: This is the width available, for drawing, in your Github history.
         * @colors: The number of commits, per date, that make up a color. Defaults to dark.
         */
        githubGrid: {
            rows: 7,
            cols: 60,
            colors: {
                light: 11,
                medium: 22,
                dark: 33,
                heavy: 44
            }
        },

        sleep: function lapiz$sleep(milliSeconds) {

            let date = new Date(),
                currentDate = null;

            do {
                currentDate = new Date();
            } while (currentDate - date < milliSeconds);
        },

        readify: function lapiz$readify() {

            let colors = Object.keys(this.githubGrid.colors),
                argumentColor;

            if (!process.argv[2]) {
                console.error('\n I need to know the word!.\n Try: node lib/lapiz.js lapiz\n');
                process.exit(1);
            }

            this.startDate = new Date();
            this.startDate.setDate(this.startDate.getDate() - 366);

            this.legend = process.argv[2].toUpperCase();

            argumentColor = process.argv[3] || null;
            this.colorLoops = colors.indexOf(argumentColor) >= 0 ? this.githubGrid.colors[argumentColor] : this.githubGrid.colors['dark'];

            this.character = process.argv[4] ? process.argv[4].toString().charAt(0) : '✮';
        },

        gridify: function lapiz$gridify() {

            let canvas = new Canvas(60, 10),
                context = canvas.getContext('2d'),
                measuredText = context.measureText(this.legend),
                grid = {
                    cols: Math.round(measuredText.width) + 1,
                    rows: Math.round(measuredText.emHeightAscent) - 1,
                    data: []
                },
                img;

            /**
             * Prepare our grid. Shame JS does not provide a shortcut to
             * do this like, for instance, Matlab: zeros(grid.rows, grid.cols)
             */
            for (let i = 0; i < grid.cols; i += 1) {
                let current = [];
                grid.data.push(current);

                for (var j = 0; j < grid.rows; j += 1) {
                    current.push([]);
                }
            }

            if (grid.cols > this.githubGrid.cols) {
                console.error('\n Sorry, but the word is too long!');
                console.error(' Maximum allowed length: ' + this.githubGrid.cols + ', your\'s was: ' + grid.cols + '\n');
                process.exit(1);
            }

            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, grid.cols, grid.rows);

            context.textBaseline = 'top';
            context.font = '10px Arial';
            context.fillStyle = '#000000';
            context.fillText(this.legend, 0, -2);

            img = context.getImageData(0, 0, grid.cols, grid.rows);

            /**
             * Populate our grid based on the above information we got from the
             * canvas/image.
             */
            for (let y = 0; y < grid.rows; y += 1) {
                for (let x = 0; x < grid.cols; x += 1) {
                    grid.data[x][y] = img.data[4 * (grid.cols * y + x)] < 170;
                }
            }

            this.grid = grid;
        },

        draw: function lapiz$draw() {

            let loop = 0,
                top = this;

            this.readify();
            this.gridify();

            process.stdout.write('\u001b[0B');
            this.grid.data.forEach(function (col) {
                loop += 1;
                col.forEach(function (row) {
                    top.startDate.setDate(top.startDate.getDate() + 1);

                    if (row) {
                        for (let colorLoop = 0; colorLoop < top.colorLoops; colorLoop += 1) {
                            exec("echo " + loop + Math.random() + " > ./support.txt ", function (err) {});
                            //exec("echo " + loop + Math.random() + " > ./support.txt && git add support.txt && GIT_AUTHOR_DATE='" + top.startDate + "' GIT_COMMITTER_DATE='" + top.startDate + "' git commit -m 'Painting my history.'", function (err) {});
                        }

                        top.sleep(50);
                    }

                    row = loop + (row ? 'C' + top.character + '\n' : 'C \n');
                    process.stdout.write('\u001b[' + row);
                });

                //exec("git rm support.txt && git commit -m 'Delete my traces...';", function (err) {});
                process.stdout.write('\u001b[' + top.grid.rows + 'A');
            });

            process.stdout.write('\u001b[' + (top.grid.rows + 1) + 'B');

            return this;
        },

        push: function lapiz$push() {
            exec("git push origin master", function (err) {
                if (err) {
                    console.error(' Error while pushing to the repository:', err, '\n');
                    return;
                }

                console.log('  Done and pushed to the repository. :)\n');
            });
        }
    };

lapiz.draw().push();