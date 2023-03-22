
function validate(event) {

    var productname = document.getElementById('basic-default-name1').value

    if (!productname.trim()) {
        
        document.getElementById('productname1').innerHTML="please fill the name field"
    }
    
}

