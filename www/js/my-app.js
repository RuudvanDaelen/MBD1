// Initialize your app
var myApp = new Framework7();

// Export selectors engine
var $$ = Dom7;

//Local Storage ophalen
var storage = window.localStorage;

//Infinite scroll variables
var loading         = false;
var lastIndex       = $$('.pokemon-list li').length; //Zal na infinite scroll hoger worden
var maxItems        = 811; //moet gezet worden met ajaxcall result.count (totaal aantal van pokemons)
var itemsPerLoad    = storage.getItem('itemsperload'); //$('#pokemonsToLoad').val(); //instellbaar met settings

$('#itemsPerLoad').text(itemsPerLoad);
$('#pokemonsToLoad').value = itemsPerLoad;

//Locatie
var maxDistanceToPokemon = 40; //Meters
var myPosition;
navigator.geolocation.getCurrentPosition(onSuccess, onError);

function onSuccess(position) {
    myPosition = position;
    //alert(position.coords.latitude + " | " + position.coords.longitude);
}
// onError Callback receives a PositionError object
function onError(error) {
    alert('code: '    + error.code    + '\n message: ' + error.message + '\n');
}

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    var distanceInMeters = (d * 1000);
    return distanceInMeters;    
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

//Detail pagina variables
var selectedPokemonId = 0;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});


//Wordt direct uitgevoerd wanneer my-app.js wordt geladen in de pagina
loadPokemons(itemsPerLoad, 0); //vanaf het begin



//ItemsToLoad setten
function setItemsPerLoad(value) {
    storage.setItem('itemsperload', ""+value); //Local storage goed zetten
    itemsPerLoad = value;
    $('#itemsPerLoad').text(itemsPerLoad);
}

function saveSettings() {
    setItemsPerLoad($('#pokemonsToLoad').val());
}


//Een pokemon ophalen aan de hand van een ID (sync)
function getPokemon(id) {
    var url = "http://pokeapi.co/api/v1/pokemon/"+id; 
    var pokemon = {};
       
    $.ajax({url: url, async: false, dataType: "json", success: function(result){
                
        pokemon.id = id;
        //Name (eerste letter uppercase maken)
        pokemon.name = result.name;
        pokemon.image = "http://pokeapi.co/media/img/"+id+".png/";
        pokemon.height = result.height;
        pokemon.weight = result.weight;
        
        pokemon.types = [];
        $.each(result.types, function(i, type) {
            pokemon.types.push(type.name);
        });
        
        pokemon.moves = [];
        $.each(result.moves, function(i, move) {
            pokemon.moves.push(move.name);
        });
        
        pokemon.latitude = 51.6850521276255;
        pokemon.longitude = 5.124607672919635;
        
    }});
    
    return pokemon;
}


//Pokemons laden
function loadPokemons(limit, offset) {
    
    var url = "http://pokeapi.co/api/v2/pokemon/?limit="+limit+"&offset="+offset;
    
    $.ajax({url: url, success: function(result){

        //Zet maxItems voor infinite scroll
        maxItems    = result.count; //Zet het maximaal aantal items dat geladen kan worden gelijk aan t aantal pokemons dat er zijn
        next        = result.next;  //Zet de volgende url gelijk aan de next

        $.each(result.results, function(i, item) {

            //Id
            var regMatch = item.url.match(/\d+\/$/);
            var pokemonId = regMatch[0].slice(0, -1);
            //Image
            var imageUrl = "http://pokeapi.co/media/img/" + pokemonId + ".png";
            //Name (eerste letter uppercase maken)
            var lowerName = item.name;
            var pokemonName = lowerName.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                return letter.toUpperCase(); 
            });

            var pokemon = { id: pokemonId, name: pokemonName, href: item.url, image: imageUrl }

            var html = "";
            html += "<li>";
            html += "<a href='detail.html?id="+ pokemon.id +"' class='item-link item-content'>";
            html += "<div class='item-media'>";
            html += "<img height='88px' width='88px' src='"+ pokemon.image +"'>";
            html += "</div>";
            html += "<div class='item-inner'>";
            html += "<div class='item-title-row'>";
            html += "<div class='item-title'>"+ pokemon.name +"</div>";
            html += "</div>";
            html += "<div class='item-subtitle'># "+ pokemon.id +"</div>";
            html += "</div>";
            html += "</a>";
            html += "</li>";
            
            $("#pokemon-list ul").append(html);
        });
        
        lastIndex = $("#pokemon-list li").length;
    }});
}

//Detail pagina genereren
$$(document).on('pageBeforeInit', function(e) { //Voordat de pagina geladen wordt, zal dit uitgevoerd worden
    var page = e.detail.page;
      
    if(page.name === 'detail') {
        selectedPokemonId = page.query.id; //SelectedPokemonId gelijk zetten aan de meegegeven id
        var selectedPokemon = getPokemon(selectedPokemonId);
        var distanceToPokemon = getDistanceFromLatLonInMeters(selectedPokemon.latitude, selectedPokemon.longitude, myPosition.coords.latitude, myPosition.coords.longitude);
        
        
        
        //alert(selectedPokemon.latitude + " | " + myPosition.coords.latitude + "\n");
        
        var html = "";
        html += "<div class='content-block'>";
        html += "<div class='content-block-inner'>";
        html += "<table >";
        html += "<tr>";
        html += "<td rowspan='3' style='width: 120px; height: 120px;'><img src='"+selectedPokemon.image+"' /></td>";
        html += "<td><b>"+selectedPokemon.name+"</b></td>";
        html += "</tr>";
        html += "<tr>";
        html += "<td># "+selectedPokemon.id+"</td>";
        html += "</tr>";
        html += "<tr>";
        html += "<td>";
        selectedPokemon.types.forEach(function(type){
           html += type + " ";
        });
        html += "</td>";
        html += "</tr>";
        html += "</table>";
        html += "</div>";
        html += "</div>";
        
        
        
        html += "<div class='list-block'>";
        html += "<ul>";
        if(distanceToPokemon <= maxDistanceToPokemon || distanceToPokemon <= (maxDistanceToPokemon + myPosition.coords.accuracy)) {
            html += "<li><a href='#' class='list-button item-link color-red'>Vangen</a></li>";
        } else {
            html += "<li><a href='#' class='list-button item-link color-red disabled'>Vangen</a></li>";
        }
        
        html += "</ul>";
        html += "</div>";

        html += "<div class='list-block'>";
        html += "<ul>";        
        html += "<li class='accordion-item'>";
        html += "<a href='#' class='item-content item-link'>";
        html += "<div class='item-inner'>";
        html += "<div class='item-title'>Evolution(s)</div>";
        html += "</div>";
        html += "</a>";
        html += "<div class='accordion-item-content'>";
        html += "<div class='content-block'>";
        html += "<p>Item 1 content. Lorem ipsum dolor sit amet...</p>";
        html += "</div>";
        html += "</div>";
        html += "</li>";
        html += "<li class='accordion-item'>";
        html += "<a href='#' class='item-content item-link'>";
        html += "<div class='item-inner'>";
        html += "<div class='item-title'>Moves(s)</div>";
        html += "</div>";
        html += "</a>";
        html += "<div class='accordion-item-content'>";
        html += "<div class='content-block'>";
        html += "<ul>";
        selectedPokemon.moves.forEach(function(move){
           html += "<li>" + move + "</li>";
        });
        html += "</ul>";
        html += "</div>";
        html += "</div>";
        html += "</li>";
        html += "</ul>";
        html += "</div>";
       
       $$(page.container).find('.page-content').append(html);
   }
});

//Infinite Scroll
$$('.infinite-scroll').on('infinite', function() {
   if(loading) return;
   
   loading = true;
   
   setTimeout(function() {
        loading = false;
        
        if(lastIndex >= maxItems) {
            myApp.detachInfiniteScroll($$('.infinite-scroll'));
            $$('.infinite-scroll-preloader').remove();
            return;
        }
        
        //Laad de pokemons
        loadPokemons(itemsPerLoad, lastIndex);
        
        lastIndex = $$('pokemon-list li').length;
   }, 1000);
});