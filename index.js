const form = document.querySelector('form');
const name = document.querySelector('#name');
const cost = document.querySelector('#cost');
const error = document.querySelector('#error');

form.addEventListener('submit',  (e)=>{
    e.preventDefault();
    if(name.value && cost.value){
      console.log(name.value);
      console.log(cost.value);
     db.collection('expenses').add({
      name: name.value,
      cost: parseInt(cost.value)
  }).then(res=>{
        error.textContent =" ";
        name.value=" ";
        cost.value=" ";
     }
     )
    }else{
        error.textContent ="error :invalid syntaxe";
    }
} );