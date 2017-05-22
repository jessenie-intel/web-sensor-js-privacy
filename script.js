console.log(5+6);
var output = document.querySelector('.output');
var dataArray = [];
var i = dataArray.length;      //index to track amount of data points
var sensors = [];
var test = null;                //testing variable

function get_click(buttonID)    //ID not necessarily numerical
{
        console.log(buttonID);
        dataArray.push(buttonID);        
        store('dataArray', dataArray);
        console.log(retrieve('dataArray'));
        test = read_sensors();
        console.log(test);
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

      try {
        sensors[0] = null;
        let accelerometer = new Accelerometer({ frequency: 50, includeGravity: true });
        sensors[0] = accelerometer;
        sensors[0].start();
        sensors[0].onerror = err => {
          sensors[0] = null;
          console.log(`Accelerometer ${err.error}`)
        };
      } catch(err) { }

        /*
        var sensor = new Accelerometer();
        sensor.start();
        sensor.onchange = event => {
                let xAccel = sensor.x;
                let yAccel = sensor.y;
                let zAccel = sensor.z;
                console.log("xAccel:" + xAccel + "yAccel: " + yAccel + "zAccel: " + zAccel);
        }
        */

        console.log(sensors);
        return sensors;
}

function read_sensors()
{
      if (!(sensors = startSensors())) {
        console.error('Could not start sensors');
        return false;
      }
        console.log(sensors);
        /*
      sensors.Accelerometer.onchange = event => {
        let xAccel = this.sensors.Accelerometer.y;
        let yAccel = this.sensors.Accelerometer.x;
        let zAccel = this.sensors.Accelerometer.z;
        console.log(xAccel, yAccel, zAccel);
        }
        return xAccel;
        */
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
