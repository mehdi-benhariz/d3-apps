const dims = {height: 300, width:300, radius:150 }
const cent ={x: (dims.width/2 +5) , y:(dims.height/2 +5) };

const svg = d3.select('.canvas').append('svg')
         .attr('width',dims.width +150 )
         .attr('height',dims.height +150 );

const graph = svg.append('g')
       .attr('transform', `translate(${cent.x},${cent.y})`);

const pie = d3.pie()
.sort(null)
.value(d=> d.cost);

const arcPath = d3.arc()
     .outerRadius(dims.radius)
     .innerRadius(dims.radius /2);

const color = d3.scaleOrdinal(d3['schemeSet3']) ;  
//legend setup 
const legendGroupe = svg.append('g')
.attr('transform',`translate(${dims.width+40},10)` )

const legend= d3.legendColor()
.shape('circle')
.shapePadding('10')
.scale(color);
//tip
const tip = d3.tip()
.attr('class','tip card' )
.html(d =>{
       let content = `<div class="name" >${d.data.name}</div >`;
       content+=`<div class="cost" >${d.data.cost}</div >`;
       content+=`<div class="delete" > click slice to delete</div >`;
       return content;

} );

graph.call(tip)


//update function
const update =(data)=>{

color.domain(data.map(d=>d.name  ));
//update legend
legendGroupe.call(legend)
legendGroupe.selectAll('text').attr('fill','white');
//delete item
const text = legendGroupe.selectAll('text');

//
const paths = graph.selectAll('path').data(pie(data));

paths.exit()
.transition().duration(1000)
.attrTween('d',arcTweenExit)
.remove();

paths.attr('d', arcPath )
.transition().duration(750)
.attrTween('d', arcTweenUpdate);

paths.enter()
.append('path')
   .attr('class','arc' )
   .attr('stroke','#fff' )
   .attr('stroke-width',3 )
   .attr('fill',d=>color(d.data.name) )
   .each(function(d){this._current=d }  )
   .transition().duration(1000)
     .attrTween('d',arcTweenEnter);

//add Event 
graph.selectAll('path')
.on('mouseover',handleMouseOver)
.on('mouseout',handleMouseOut)
.on('click',handleClick);

legendGroupe.selectAll('text')
//delete item


// console.log("data:",pie(data))
// console.log("graph:",graph)
// console.log("svg",svg)  

};
//
var data =[];
//interaction with direbase
db.collection('expenses').onSnapshot({ includeMetadataChanges: true },res=>{

       res.docChanges().forEach(change=>{
              const doc ={...change.doc.data(),id:change.doc.id};
              switch(change.type){
                     case 'added':
                            data.push(doc);
                            break;
                     case 'modified':
                            data[data.findIndex(item=>item.id ==doc.id )] = doc;
                            break;
                     case 'removed':
                            data.filter(item => item.id !== doc.id)
                            break;
                     default : 
                            break;
              }
              var source = res.metadata.fromCache ? "local cache" : "server";
              console.log("Data came from " + source);
       } )
       update(data);

});
//
const arcTweenEnter =(d)=>{
       var i = d3.interpolate(d.endAngle,d.startAngle);

       return function(t){
              d.startAngle = i(t)
              return arcPath(d)
       }
}

const arcTweenExit =(d)=>{
       var i = d3.interpolate(d.startAngle,d.endAngle);

       return function(t){
              d.startAngle = i(t)
              return arcPath(d)
       }
};

//use function keyboard to allow the use if this
function arcTweenUpdate(d){
//interpolate between the two object
var i =d3.interpolate(this._current,d)
//update the current prop wtih new data
this._current=i(1);

return function(t){
       return arcPath(i(t));
}
};

const handleMouseOver=(d,i,n)=>{
       tip.show(d,n[i])
       d3.select(n[i])
        .transition('changeSliceFill').duration(300)
          .attr('fill','#fff')
}

const handleMouseOut=(d,i,n)=>{
       tip.hide(d,n[i])

       d3.select(n[i])
        .transition('changeSliceFill').duration(300)
          .attr('fill',color(d.data.name))
}

const handleClick =(d,i,n)=>{
       const id= d.data.id;
       db.collection('expenses').doc(id).delete();
     
}