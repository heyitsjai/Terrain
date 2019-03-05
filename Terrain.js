/**
 * @fileoverview Terrain - A simple 3D terrain using WebGL
 * @author Eric Shaffer
 */

/** Class implementing 3D terrain. */
class Terrain{   
/**
 * Initialize members of a Terrain object
 * @param {number} div Number of triangles along x axis and y axis
 * @param {number} minX Minimum X coordinate value
 * @param {number} maxX Maximum X coordinate value
 * @param {number} minY Minimum Y coordinate value
 * @param {number} maxY Maximum Y coordinate value
 */
    constructor(div,minX,maxX,minY,maxY){
        this.div = div;
        this.minX=minX;
        this.minY=minY;
        this.maxX=maxX;
        this.maxY=maxY;
        this.s = div + 1; 

        // Allocate color array
        this.colors = [];
        // Allocate height array 
        this.hBuffer =[];       
        // Allocate vertex array
        this.vBuffer = [];
        // Allocate triangle array
        this.fBuffer = [];
        // Allocate normal array
        this.nBuffer = [];
        // Allocate array for edges so we can draw wireframe
        this.eBuffer = [];

        this.fnBuffer =[];
        console.log("Terrain: Allocated buffers");
        
        this.generateTriangles();
        console.log("Terrain: Generated triangles");
        
        this.generateLines();
        console.log("Terrain: Generated lines");
        
        // Get extension for 4 byte integer indices for drwElements
        var ext = gl.getExtension('OES_element_index_uint');
        if (ext ==null){
            alert("OES_element_index_uint is unsupported by your browser and terrain generation cannot proceed.");
        }
    }
    
    /**
    * Set the x,y,z coords of a vertex at location(i,j)
    * @param {Object} v an an array of length 3 holding x,y,z coordinates
    * @param {number} i the ith row of vertices
    * @param {number} j the jth column of vertices
    */
    setVertex(v,i,j)
    {
        //Your code here
        var vid = 3*(i*(this.div+1)+j); 
        this.vBuffer[vid] =  v[0];  
        this.vBuffer[vid + 1] = v[1]; 
        this.vBuffer[vid + 2] = v[2];  
    }
    
    /**
    * Return the x,y,z coordinates of a vertex at location (i,j)
    * @param {Object} v an an array of length 3 holding x,y,z coordinates
    * @param {number} i the ith row of vertices
    * @param {number} j the jth column of vertices
    */
    getVertex(v,i,j)
    {
        //Your code here
        var vid = 3*(i*(this.div+1)+j);  
        v[0] = this.vBuffer[vid];
        v[1] = this.vBuffer[vid + 1]; 
        v[2] = this.vBuffer[vid + 2];         
    }



    
    /**
    * Send the buffers objects to WebGL for rendering 
    */
    loadBuffers()
    {
        // Specify the vertex coordinates
        this.VertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);      
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vBuffer), gl.STATIC_DRAW);
        this.VertexPositionBuffer.itemSize = 3;
        this.VertexPositionBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.VertexPositionBuffer.numItems, " vertices");
    
        // Specify normals to be able to do lighting calculations
        this.VertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.nBuffer),
                  gl.STATIC_DRAW);
        this.VertexNormalBuffer.itemSize = 3;
        this.VertexNormalBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.VertexNormalBuffer.numItems, " normals");
    
        // Specify faces of the terrain 
        this.IndexTriBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexTriBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.fBuffer),
                  gl.STATIC_DRAW);
        this.IndexTriBuffer.itemSize = 1;
        this.IndexTriBuffer.numItems = this.fBuffer.length;
        console.log("Loaded ", this.numFaces, " triangles");
    
        //Setup Edges  
        this.IndexEdgeBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexEdgeBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.eBuffer),
                  gl.STATIC_DRAW);
        this.IndexEdgeBuffer.itemSize = 1;
        this.IndexEdgeBuffer.numItems = this.eBuffer.length;
        
        console.log("triangulatedPlane: loadBuffers");

        this.vertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
        this.vertexColorBuffer.itemSize = 4;
        this.vertexColorBuffer.numItems = this.colors.length; 
    }
    
    /**
    * Render the triangles 
    */
    drawTriangles(){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.VertexPositionBuffer.itemSize, 
                         gl.FLOAT, false, 0, 0);

        // Bind normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                           this.VertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);  

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                                this.vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0); 
    
        //Draw 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexTriBuffer);
        gl.drawElements(gl.TRIANGLES, this.IndexTriBuffer.numItems, gl.UNSIGNED_INT,0);
    }


    
    /**
    * Render the triangle edges wireframe style 
    */
    drawEdges(){
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.VertexPositionBuffer.itemSize, 
                         gl.FLOAT, false, 0, 0);

        // Bind normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                           this.VertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);   
    
        //Draw 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexEdgeBuffer);
        gl.drawElements(gl.LINES, this.IndexEdgeBuffer.numItems, gl.UNSIGNED_INT,0);   
    }

/**
*  Diamond Square algorithim 
*/
diamondSquare(offset)
{
    var x; // x iterator
    var y; // y iterator
    var mid = offset/2; // mid
    var perturbation = 0.001 * offset; //perturb factor
    var ll,lr,ur,ul; //diamond vertices
    var t,r,b,l;  //square vertices
    //console.log("1");
    if(mid < 1)
    {
        return; 
    }
    /*diamond step */

    //loop goes through and checks for each corner, if it exists grab it if it doesnt set to 0 (may change this)
    for(y = mid; y < this.div; y += offset)
    {
        for(x = mid; x < this.div; x += offset)
        {
            if((x - mid) < 0 || (x - mid) > this.div || (y + mid) < 0 || (y + mid) > this.div)
            {
                ll = 0; 
            }
            else
            {
                ll = this.hBuffer[(x - mid) + this.s * (y + mid)];
            }
            if((x + mid) < 0 || (x + mid) > this.div || (y + mid) < 0 || (y + mid) > this.div)
            {
                lr = 0; 
            }
            else
            {
                lr = this.hBuffer[(x + mid) + this.s * (y + mid)];
            }
            if((x + mid) < 0 || (x + mid) > this.div || (y - mid) < 0 || (y - mid) > this.div)
            {
                ur = 0; 
            }
            else
            {
                ur = this.hBuffer[(x + mid) + this.s * (y - mid)];
            }
            if((x - mid) < 0 || (x - mid) > this.div || (y - mid) < 0 || (y - mid) > this.div)
            {
                ul = 0; 
            }
            else
            {
                ul = this.hBuffer[(x - mid) + this.s * (y - mid)];
            }
            var average = (ll+lr+ur+ul)/4; //get center 
            //console.log(average);
            this.hBuffer[x + y*this.s] = average + Math.random()*perturbation*2 - offset*0.001; //apply random offset change to the center
            //console.log("2");
        }

    }

    /*square step */


    //gets the square vertices if they exist if not fill the value with 0; 
    for(y = 0; y <= this.div ; y+=mid)
    {
        for(x = (y+mid)%offset; x <= this.div; x+= offset)
        {
            if (x < 0 || x > this.div || (y - mid) < 0 || (y - mid) > this.div)
            {
                t = 0; 
            }
            else
            {
                t = this.hBuffer[ x + this.s * (y - mid)];
            }
            if ((x + mid) < 0 || (x + mid) > this.div || y < 0 || y > this.div)
            {
                r = 0; 
            }
            else
            {
                r = this.hBuffer[ (x + mid) + this.s * y];
            }
            if (x < 0 || x > this.div || (y + mid) < 0 || (y + mid) > this.div)
            {
                b = 0; 
            }
            else
            {
                b = this.hBuffer[ x  + this.s * (y + mid)];
            }
            if ((x - mid) < 0 || (x - mid) > this.div || y < 0 || y > this.div)
            {
                l = 0; 
            }
            else
            {
                l = this.hBuffer[(x - mid) + this.s * y];
            }
            var average2 = (t+r+b+l)/4; // get average 
            this.hBuffer[x + y*this.s] = average2 + Math.random()*perturbation*2 - offset* 0.001; //apply random offset
            // console.log("3");
        }
    }

    //recurse
    this.diamondSquare(offset/2); 
}

/**
 * Fill the vertex and buffer arrays 
 */    
generateTriangles()
{
    //Your code here
    for(var i = 0; i < (this.s *this.s); i++) 
    {
        this.hBuffer.push(0);
    }

    // intialize corners
    this.hBuffer[0] = 0;
    this.hBuffer[this.div] = 0.01;
    this.hBuffer[this.div + this.div*this.s] = 0.01; 
    this.hBuffer[this.div*this.s] = 0;

    //call diamond square 
    this.diamondSquare(this.div);

    var deltaX = (this.maxX - this.minX)/this.div; 
    var deltaY = (this.maxY - this.minY)/this.div; 


    for(var i = 0; i <= this.div; i++)
    {
        for(var j = 0; j<=this.div; j++)
        {
            this.vBuffer.push(this.minX + deltaX*j);
            this.vBuffer.push(this.minY + deltaY*i);
            this.vBuffer.push(this.hBuffer[i + j*this.s]);

            // this.nBuffer.push(0);
            // this.nBuffer.push(0); 
            // this.nBuffer.push(1);


            //attribute height based on colors
            //I am color blind excuse intensity of colors I will change when im confident it is working 
            if(this.hBuffer[i+j*this.s]>0.1) //if certain height make color
            {
                this.colors.push(0)
                this.colors.push(0)
                this.colors.push(1.0)
                this.colors.push(1.0)
            }
            else if(this.hBuffer[i+j*this.s]>0.05) 
            {
                this.colors.push(1.0)
                this.colors.push(0)
                this.colors.push(1.0)
                this.colors.push(1.0)
            }
            else if(this.hBuffer[i+j*this.s] > 0)
            {
                this.colors.push(1.0)
                this.colors.push(0)
                this.colors.push(0)
                this.colors.push(1.0)
            }
            else if(this.hBuffer[i+j*this.s] < 0)
            {
                this.colors.push(0.2)
                this.colors.push(0.1)
                this.colors.push(0)
                this.colors.push(1.0)
            }
            else
            {
                this.colors.push(0)
                this.colors.push(1.0)
                this.colors.push(0)
                this.colors.push(1.0)
            }            
        }

    }

    for(var i = 0; i < this.div; i++)
    {
        for(var j = 0; j < this.div; j++)
        {
            var vid = i*(this.div+1) +j; 
            this.fBuffer.push(vid);
            this.fBuffer.push(vid+1);
            this.fBuffer.push(vid+this.div + 1);

            this.fBuffer.push(vid + 1);
            this.fBuffer.push(vid + 1 + this.div + 1);
            this.fBuffer.push(vid + this.div + 1);
        }
    }


    //normals calculation

    //follows method described in class
    //gets a point, gets the values of the six triangles surrounding it 
    //(if no triangle exists input the regular normal)
    //then sums all the triangles normals and makes that point have that normal
    for (var i = 0; i <= this.div; i++) 
    {
        for (var j = 0; j <= this.div; j++) 
        { 
            //intialize point we are looking at lets call it center
            var center = vec3.create();

            //get the point
            if (i < 0 || i > this.div || j < 0 || j > this.div) 
            {
                center[0] = 0;
                center[1] = 0;
                center[2] = 1;
            }
            else
            {
                var vid = 3*(i*(this.div+1) + j);
                center[0] = this.vBuffer[vid];
                center[1] = this.vBuffer[vid+1];
                center[2] = this.vBuffer[vid+2];
            }
            //intialize values to use later 
            var final = vec3.create();
            var normal = vec3.create();
            var line1 = vec3.create();
            var line2 = vec3.create();

            //get each triangle at each possible location from center

            
            //first triangle

            //get first line
            if ((i+1) < 0 || (i+1) > this.div || j < 0 || j > this.div) 
            {
                line1[0] = 0;
                line1[1] = 0;
                line1[2] = 1;
            }
            else
            {
                var vid = 3*((i+1)*(this.div+1) + j);
                line1[0] = this.vBuffer[vid];
                line1[1] = this.vBuffer[vid+1];
                line1[2] = this.vBuffer[vid+2];
            }
            //get second line
            if ((i+1) < 0 || (i+1) > this.div || (j+1) < 0 || (j+1) > this.div) 
            {
                line2[0] = 0;
                line2[1] = 0;
                line2[2] = 1;
            }
            else
            {
                var vid = 3*((i+1)*(this.div+1) + (j+1));
                line2[0] = this.vBuffer[vid];
                line2[1] = this.vBuffer[vid+1];
                line2[2] = this.vBuffer[vid+2];
            }

            //perform normalization on that triangle
            vec3.subtract(line1, center, line1);
            vec3.subtract(line2, center, line2);
            vec3.cross(normal, line1, line2);
            vec3.normalize(normal, normal);
            vec3.add(final, final, normal);


            //second triangle

            if (i < 0 || i > this.div || (j-1) < 0 || (j-1) > this.div) 
            {
                line1[0] = 0;
                line1[1] = 0;
                line1[2] = 1;
            }
            else
            {
                var vid = 3*(i*(this.div+1) + j-1);
                line1[0] = this.vBuffer[vid];
                line1[1] = this.vBuffer[vid+1];
                line1[2] = this.vBuffer[vid+2];
            }

            if ((i+1) < 0 || (i+1) > this.div || j < 0 || j > this.div) 
            {
                line2[0] = 0;
                line2[1] = 0;
                line2[2] = 1;
            }
            else
            {
                var vid = 3*((i+1)*(this.div+1) + j);
                line2[0] = this.vBuffer[vid];
                line2[1] = this.vBuffer[vid+1];
                line2[2] = this.vBuffer[vid+2];
            }


            vec3.subtract(line1, center, line1);
            vec3.subtract(line2, center, line2);
            vec3.cross(normal, line1, line2);
            vec3.normalize(normal, normal);
            vec3.add(final, final, normal);
            

        
            //third triangle
            if ( i < 0 || i > this.div || (j-1) < 0 || (j-1) > this.div) 
            {
                line1[0] = 0;
                line1[1] = 0;
                line1[2] = 1;
            }
            else
            {
                var vid = 3*((i)*(this.div+1) + (j-1));
                line1[0] = this.vBuffer[vid];
                line1[1] = this.vBuffer[vid+1];
                line1[2] = this.vBuffer[vid+2];
            }

            if ((i-1) < 0 || (i-1) > this.div || (j-1) < 0 || (j-1) > this.div) 
            {
                line2[0] = 0;
                line2[1] = 0;
                line2[2] = 1;
            }
            else
            {
                var vid = 3*((i-1)*(this.div+1) + (j-1));
                line2[0] = this.vBuffer[vid];
                line2[1] = this.vBuffer[vid+1];
                line2[2] = this.vBuffer[vid+2];
            }
            vec3.subtract(line1, center, line1);
            vec3.subtract(line2, center, line2);
            vec3.cross(normal, line1, line2);
            vec3.normalize(normal, normal);
            vec3.add(final, final, normal);

            //fourth triangle
            if ((i+1) < 0 || (i+1) > this.div || (j+1) < 0 || (j+1) > this.div) 
            {
                line1[0] = 0;
                line1[1] = 0;
                line1[2] = 1;
            }
            else
            {
                var vid = 3*((i+1)*(this.div+1) + (j+1));
                line1[0] = this.vBuffer[vid];
                line1[1] = this.vBuffer[vid+1];
                line1[2] = this.vBuffer[vid+2];
            }

            if (i < 0 || i > this.div || (j+1) < 0 || (j+1) > this.div) 
            {
                line2[0] = 0;
                line2[1] = 0;
                line2[2] = 1;
            }
            else
            {
                var vid = 3*(i*(this.div+1) + (j+1));
                line2[0] = this.vBuffer[vid];
                line2[1] = this.vBuffer[vid+1];
                line2[2] = this.vBuffer[vid+2];
            }

            vec3.subtract(line1, center, line1);
            vec3.subtract(line2, center, line2);
            vec3.cross(normal, line1, line2);
            vec3.normalize(normal, normal);
            vec3.add(final, final, normal);
           
            
            //fifth triangle

            if ((i-1) < 0 || (i-1) > this.div || (j-1) < 0 || (j-1) > this.div) 
            {
                line1[0] = 0;
                line1[1] = 0;
                line1[2] = 1;
            }
            else
            {
                var vid = 3*((i-1)*(this.div+1) + (j-1));
                line1[0] = this.vBuffer[vid];
                line1[1] = this.vBuffer[vid+1];
                line1[2] = this.vBuffer[vid+2];
            }

            if ((i-1) < 0 || (i-1) > this.div || j < 0 || j > this.div) 
            {
                line2[0] = 0;
                line2[1] = 0;
                line2[2] = 1;
            }
            else
            {
                var vid = 3*((i-1)*(this.div+1) + j);
                line2[0] = this.vBuffer[vid];
                line2[1] = this.vBuffer[vid+1];
                line2[2] = this.vBuffer[vid+2];
            }

            vec3.subtract(line1, center, line1);
            vec3.subtract(line2, center, line2);
            vec3.cross(normal, line1, line2);
            vec3.normalize(normal, normal);
            vec3.add(final, final, normal);
          

            //sixth triangle

            if ((i-1) < 0 || (i-1) > this.div || j < 0 || j > this.div) 
            {
                line1[0] = 0;
                line1[1] = 0;
                line1[2] = 1;
            }
            else
            {
                var vid = 3*((i-1)*(this.div+1) + j);
                line1[0] = this.vBuffer[vid];
                line1[1] = this.vBuffer[vid+1];
                line1[2] = this.vBuffer[vid+2];
            }

            if (i < 0 || i > this.div || (j+1) < 0 || (j+1) > this.div) 
            {
                line2[0] = 0;
                line2[1] = 0;
                line2[2] = 1;
            }
            else
            {
                var vid = 3*(i*(this.div+1) + (j+1));
                line2[0] = this.vBuffer[vid];
                line2[1] = this.vBuffer[vid+1];
                line2[2] = this.vBuffer[vid+2];
            }

            vec3.subtract(line1, center, line1);
            vec3.subtract(line2, center, line2);
            vec3.cross(normal, line1, line2);
            vec3.normalize(normal, normal);
            vec3.add(final, final, normal);
           

            // calculate average
            vec3.scale(final, final, 1/6);

            // push values
            this.nBuffer.push(final[0]);
            this.nBuffer.push(final[1]);
            this.nBuffer.push(final[2]);
        }
    }

    this.numVertices = this.vBuffer.length/3;
    this.numFaces = this.fBuffer.length/3;
    this.numColors = this.colors.length/4;





}

/**
 * Print vertices and triangles to console for debugging
 */
printBuffers()
    {
        
    for(var i=0;i<this.numVertices;i++)
          {
           console.log("v ", this.vBuffer[i*3], " ", 
                             this.vBuffer[i*3 + 1], " ",
                             this.vBuffer[i*3 + 2], " ");
                       
          }
    
      for(var i=0;i<this.numFaces;i++)
          {
           console.log("f ", this.fBuffer[i*3], " ", 
                             this.fBuffer[i*3 + 1], " ",
                             this.fBuffer[i*3 + 2], " ");
                       
          }
        
    }

/**
 * Generates line values from faces in faceArray
 * to enable wireframe rendering
 */
generateLines()
{
    var numTris=this.fBuffer.length/3;
    for(var f=0;f<numTris;f++)
    {
        var fid=f*3;
        this.eBuffer.push(this.fBuffer[fid]);
        this.eBuffer.push(this.fBuffer[fid+1]);
        
        this.eBuffer.push(this.fBuffer[fid+1]);
        this.eBuffer.push(this.fBuffer[fid+2]);
        
        this.eBuffer.push(this.fBuffer[fid+2]);
        this.eBuffer.push(this.fBuffer[fid]); 
    }
    
}







    
}
