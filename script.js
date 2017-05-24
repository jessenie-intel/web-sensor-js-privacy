var output = document.querySelector('.output');
var dataArray = [];     //array to store multiple dataObjects (one dataObject for each button press)
var dataObject = {button:null, acceleration:null, accelerationnog:null, orientation:null, rotation:null};    //single reading of all the sensor data, each object a list of values obtained during button press

//below are variables for storing data for single button press
var accelerationData = [];      //list of all acceleration data
var accelerationnogData = [];   //list of acceleration data without gravity
var orientationData = [];
var orientationMatTemp = null;       //temp variable for storing orientation matrix
var rotationData = [];

var sensors = {};
var currentButton = null;
var test = null;                //testing variable
var accel = null;
var accelNoG;
var recording = false;  //are we recording data or not?
var sensorfreq = 60;     //for setting desired sensor frequency
var nosensors = false;  //for testing with fake values and without sensors


//TODO: How to get acceleration without gravity?


class LowPassFilterData {       //https://w3c.github.io/motion-sensors/#pass-filters
  constructor(reading, bias) {
    Object.assign(this, { x: reading.x, y: reading.y, z: reading.z });
    this.bias = bias;
  }
/*
        update(reading) {
                this.x = this.x * this.bias + reading.x * (1 - this.bias);
                this.y = this.y * this.bias + reading.y * (1 - this.bias);
                this.z = this.z * this.bias + reading.z * (1 - this.bias);

        }
*/
        update(reading) {       //also normalizes
                let x = this.x * this.bias + reading.x * (1 - this.bias);
                let y = this.y * this.bias + reading.y * (1 - this.bias);
                let z = this.z * this.bias + reading.z * (1 - this.bias);
                let norm = Math.sqrt(x * x + y * y + z * z);
                this.x = 9.81 * x / norm;
                this.y = 9.81 * y / norm;
                this.z = 9.81 * z / norm;

        }
        normalize()
        {
                //normalize to "known value" 9.81 m/s^2
                let norm = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);        
                this.x = 9.81 * this.x / norm;
                this.y = 9.81 * this.y / norm;
                this.z = 9.81 * this.z / norm;
        }
};

function magnitude(vector)      //Calculate the magnitude of a vector
{
return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
}

function update_text()
{
                //document.getElementById("accl").textContent = "xAccel: " + accel.x.toFixed(3) + " yAccel: " + accel.y.toFixed(3) + " zAccel: " + accel.z.toFixed(3);
                //document.getElementById("accl_nog").textContent = "xAccelNoG: " + accelNoG.x.toFixed(3) + " yAccelNoG: " + accelNoG.y.toFixed(3) + " zAccelNoG: " + accelNoG.z.toFixed(3) + " Magnitude: " + magnitude(accelNoG).toFixed(3);
}

function stop_sensors()
{
        sensors.Accelerometer.stop();
        sensors.AbsoluteOrientationSensor.stop();     //don't stop due to the delay in starting up
        sensors.Gyroscope.stop();
}

function reset_data()   //to be run every button press and release
{
        accelerationData = [];        //reset accelerationData every new button press
        accelerationnogData = [];        //reset accelerationnogData every new button press
        orientationData = [];        //reset orientationData every new button press
        rotationData = [];
}

//create orientation matrix
function matrix( rows, cols, defaultValue){ //http://stackoverflow.com/a/18116922

        var arr = [];

        // Creates all lines:
        for(var i=0; i < rows; i++){

        // Creates an empty line
        arr.push([]);

        // Adds cols to the empty line:
        arr[i].push( new Array(cols));

        for(var j=0; j < cols; j++){
        // Initializes:
        arr[i][j] = defaultValue;
        }
        }

        return arr;
}
var orientationMat = new Float64Array([1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6]);     //device orientation
//console.log("Orientation matrix: " + orientationMat);

function get_click(buttonID)    //ID not necessarily numerical
{
        currentButton = buttonID;
        document.getElementById("bstate").textContent = `Button state (${currentButton})`;
        console.log(buttonID);
        recording = true;
        reset_data();
        test = read_sensors();
        update_text();
        //console.log(test);
}

function release()
{        
        console.log(currentButton);
        //save data to dataObject
        dataObject.button = currentButton;
        dataObject.acceleration = accelerationData;
        dataObject.accelerationnog = accelerationnogData;
        dataObject.orientation = orientationData;
        dataObject.rotation = rotationData;
        reset_data();
        var b = new Object;     //need to push by value
        Object.assign(b, dataObject);
        dataArray.push(b);        
        //store('dataArray', dataArray);
        //console.log(retrieve('dataArray'));
        currentButton = null;
        document.getElementById("bstate").textContent = `Button state (${currentButton})`;
        recording = false;
        console.log('release');
      try {
        //stop_sensors();
      } catch(err) { }

}

function store (key, data)   //currently uses LocalStorage, maybe should use something else?
{
        if (typeof(Storage) !== "undefined") 
        {
                localStorage.setItem(key, JSON.stringify(data));
                return 0;     
        } 
        else 
        {
                console.log('No LocalStorage support');
                return 1;
        }
}

function retrieve (key)
{
        return JSON.parse(localStorage.getItem(key));
}

function startSensors() {
        if(!(nosensors))
        {
      try {
        //Accelerometer including gravity
        accelerometer = new Accelerometer({ frequency: sensorfreq, includeGravity: true });
        sensors.Accelerometer = accelerometer;
        sensors.Accelerometer.start();
        accel = accelerometer;
        gravity =  new LowPassFilterData(sensors.Accelerometer, 0.8);   //GLOBAL
        //console.log(accel);
        sensors.Accelerometer.onerror = err => {
          sensors.Accelerometer = null;
          console.log(`Accelerometer ${err.error}`)
        };
        //AbsoluteOrientationSensor
        let absoluteorientationsensor = new AbsoluteOrientationSensor({ frequency: sensorfreq});
        sensors.AbsoluteOrientationSensor = absoluteorientationsensor;
        sensors.AbsoluteOrientationSensor.start();
        sensors.AbsoluteOrientationSensor.onerror = err => {
          sensors.AbsoluteOrientationSensor = null;
          console.log(`Absolute orientation sensor ${err.error}`)
        };
        //Gyroscope
        let gyroscope = new Gyroscope({ frequency: sensorfreq});
        sensors.Gyroscope = gyroscope;
        sensors.Gyroscope.start();
        sensors.Gyroscope.onerror = err => {
          sensors.Gyroscope = null;
          console.log(`Gyroscope ${err.error}`)
        };
      } catch(err) { console.log(err); }

        console.log("Started sensors: " + sensors);
        console.log(sensors);
        return sensors;
        }
        else
        {
                return null;
        }
}

function read_sensors()
{
        if (currentButton)
        {
                sensors = startSensors();
               if(!(nosensors))
                { 
                      if (!(sensors.Accelerometer || sensors.AbsoluteOrientationSensor)) {
                        console.error('Requires linear acceleration sensor, accelerometer and absolute orientation sensor');
                        return false;
                      }      
                        console.log("Sensors to be read: " + sensors);

                      accelerometer.onchange = event => {
                                //accel = {x:1.1, y:2.2, z: 7.7}  //TESTI
                                gravity.update(accelerometer);
                                //gravity.normalize();    //To do this or to not do this..? NaN problems
                                if (!(isNaN(gravity.x) && isNaN(gravity.y) && isNaN(gravity.z)))      //to prevent NaN
                                {
                                        accelNoG = {x:accelerometer.x - gravity.x, y:accelerometer.y - gravity.y, z:accelerometer.z - gravity.z}
                                        document.getElementById("accl_nog").textContent = `Acceleration without gravity (${accelNoG.x.toFixed(3)}, ${accelNoG.y.toFixed(3)}, ${accelNoG.z.toFixed(3)} Magnitude: (${magnitude(accelNoG).toFixed(3)}))`;
                                        //console.log(`Isolated gravity (${gravity.x}, ${gravity.y}, ${gravity.z})`);
                                        document.getElementById("g_accl").textContent = `Isolated gravity (${gravity.x.toFixed(3)}, ${gravity.y.toFixed(3)}, ${gravity.z.toFixed(3)} Magnitude: (${magnitude(gravity).toFixed(3)}))`;
                                        if (recording)
                                        {
                                                accelerationData.push(accelerometer);
                                                accelerationnogData.push(accelNoG);
                                        }
                                }
                                else
                                {
                                        console.log("Gravity NaN");
                                }
                                //console.log("xAccel: " + accel.x + " yAccel: " + accel.y + " zAccel: " + accel.z);
                                //console.log("xG: " + gravity.x + " yG: " + gravity.y + " zG: " + gravity.z);
                                //console.log("xAccelNoG: " + accelNoG.x + " yAccelNoG: " + accelNoG.y + " zAccelNoG: " + accelNoG.z);
                        } 
        /*
                      sensors.AccelerometerNoG.onchange = event => {
                        let xAccelNoG = sensors.AccelerometerNoG.x;
                        let yAccelNoG = sensors.AccelerometerNoG.y;
                        let zAccelNoG = sensors.AccelerometerNoG.z;
                        console.log("xAccelNoG: " + xAccelNoG + " yAccelNoG: " + yAccelNoG + " zAccelNoG: " + zAccelNoG);
                        }
        */
                        sensors.AbsoluteOrientationSensor.onchange = event => {
                        sensors.AbsoluteOrientationSensor.populateMatrix(orientationMat);
                        orientationMatTemp = new Object;     //need to push orientation matrix by value
                        Object.assign(orientationMatTemp, orientationMat);
                        orientationData.push(orientationMatTemp);
                        orientationMatTemp = null;
                        //console.log("Orientation matrix: " + orientationMat);
                                        document.getElementById("ori").textContent = `Orientation matrix (${orientationMat[0]} ${orientationMat[1]} ${orientationMat[2]} ${orientationMat[3]} \n ${orientationMat[4]} ${orientationMat[5]} ${orientationMat[6]})`;
                      }
                      sensors.Gyroscope.onchange = event => {
                        var velGyro = {x:sensors.Gyroscope.x, y:sensors.Gyroscope.y, z:sensors.Gyroscope.z};
                                        document.getElementById("rrate").textContent = `Rotation rate (${velGyro.x.toFixed(3)}, ${velGyro.y.toFixed(3)}, ${velGyro.z.toFixed(3)} Magnitude: (${magnitude(velGyro).toFixed(3)}))`;
                        rotationData.push(velGyro);
                        //console.log("xVelGyro: " + xVelGyro + " yVelGyro: " + yVelGyro + " zVelGyro: " + zVelGyro);
                        };
                        return true;
                }
        }
}

//below uses Screen Orientation API
/*
if(window.deviceOrientationEvent)
{
        window.addEventListener('deviceorientation', function(event)
                {
                        console.log('Alpha(x): ' + event.alpha +  'Beta(y): ' + event.beta + 'Gamma(z): ' + event.gamma);
                        output.innerHTML  = "beta : " + event.beta + "\n";
                        output.innerHTML += "gamma: " + event.gamma + "\n";
                        //data = ...;
                }
        );
}
if(window.DeviceMotionEvent)
{
        window.addEventListener('devicemotion', function(event)
	        {
		        var acceleration = event.acceleration;
  		        var rotationRate = event.rotationRate;
	                var gacc = event.accelerationIncludingGravity;
	          
	                console.log(acceleration.x + ' : ' + acceleration.y + ' : ' + acceleration.z);
                        console.log(event.acceleration + ' : ' + event.rotationRate + ' : ' + event.interval);
                        console.log(rotationRate.alpha + ' : ' + rotationRate.beta + ' : ' + rotationRate.gamma);
                        //console.log(gacc.x + ' : ' + gacc.y + ' : ' + gacc.z);
                        //data = ...                        
	        }
        );

}*/
//store(data);
