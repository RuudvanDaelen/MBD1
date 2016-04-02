// Initialize your app
var myApp = new Framework7();

// Export selectors engine
var $$ = Dom7;

//Local Storage ophalen
var storage = window.localStorage;

if(storage.getItem('myPokemons') != null) {
    //alert(storage.getItem('myPokemons'));
    var myPokemons = JSON.parse(storage.getItem('myPokemons'));
    //alert(myPokemons);
} else {
    var myPokemons = [];
}


//Infinite scroll variables
var loading         = false;
var lastIndex       = $$('.pokemon-list li').length; //Zal na infinite scroll hoger worden
var maxItems        = 721; //moet gezet worden met ajaxcall result.count (totaal aantal van pokemons)

if(storage.getItem('itemsperload') != null) {
    var itemsPerLoad    = storage.getItem('itemsperload'); //$('#pokemonsToLoad').val(); //instellbaar met settings  
} else {
    var itemsPerLoad = 20;
}


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

function openExternalLink(url) {
    window.open(url, '_system', 'location=yes');
}

function catchPokemon(pokemonId, pokemonName) {
    
    var imageUrl = "http://pokeapi.co/media/img/" + pokemonId + ".png";
    var pokemon = { id: pokemonId, name: pokemonName, image: imageUrl };
    
    myApp.alert("You caught \"" + pokemon.name + "\"", "");
    
    myPokemons.push(pokemon);
    storage.setItem('myPokemons', JSON.stringify(myPokemons));
    $('#catchPokemonButton').addClass('disabled');
    
}

//Controleer of je de pokemon al hebt
function hasPokemon(id) {
    var hasPokemon = false;
    $.each(myPokemons, function(i, pokemon) {
        if(pokemon.id == id) {
            hasPokemon = true;
        }
    });
    return hasPokemon; 
}

function freePokemon(id) {
    var newMyPokemons = [];
    $.each(myPokemons, function(i, pokemon) {
        
        if(pokemon.id != id) {
            newMyPokemons.push(pokemon);
        } else {
            myApp.alert("You freed \"" + pokemon.name + "\"", "");
            //Refresh page of remove li uit de lijst
        }
    });
    myPokemons = newMyPokemons;
    storage.setItem('myPokemons', JSON.stringify(myPokemons));
    
}

//Een pokemon ophalen aan de hand van een ID (sync)
function getPokemon(id) {
    var url = "http://pokeapi.co/api/v1/pokemon/"+id; 
    var pokemon = {};
       
    $.ajax({url: url, dataType: "json", success: function(result){
                
        pokemon.id = id;
        pokemon.externalURL = "https://www.pokemon.com/us/pokedex/"+result.name;
        //Name (eerste letter uppercase maken)
        pokemon.name = result.name;
        pokemon.image = "http://pokeapi.co/media/img/"+id+".png/";
        pokemon.height = result.height;
        pokemon.weight = result.weight;
        
        pokemon.types = [];
        $.each(result.types, function(i, type) {
            pokemon.types.push(type.name);
        });
        
        pokemon.evolutions = [];
        $.each(result.evolutions, function(i, evolution) {
           pokemon.evolutions.push(evolution.to); 
        });
        
        pokemon.moves = [];
        $.each(result.moves, function(i, move) {
            pokemon.moves.push(move.name);
        });
        
        //Thuis
        pokemon.latitude = 51.6850521276255;
        pokemon.longitude = 5.124607672919635;
        
        //School
        //pokemon.latitude = 51.6884299;
        //pokemon.longitude = 5.2870015;
    }});
    
    return pokemon;
}

//Pokemons laden in de lijst
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

            var pokemon = { id: pokemonId, name: pokemonName, href: item.url, image: imageUrl };

            var html = "";
            html += "<li>";
            html += "<a href='detail.html?id="+ pokemon.id +"' class='item-link item-content'>";
            html += "<div class='item-media'>";
            html += "<img height='88px' width='88px' src='"+ pokemon.image +"' class='lazy lazy-fadein'>";
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
$$(document).on('pageBeforeAnimation', function(e) { //Voordat de pagina geladen wordt, zal dit uitgevoerd worden
    var page = e.detail.page;
    
    if(page.name === 'pokemons') {
        
        if(page.fromPage.name === 'index') {
           $.each(myPokemons, function(i, pokemon) {
                var html = "";
                html += "<li>";
                html += "<div class='item item-content'>";
                html += "<div class='item-media'>";
                html += "<img height='88px' width='88px' src='"+ pokemon.image +"' class='lazy lazy-fadein'>";
                html += "</div>";
                html += "<div class='item-inner'>";
                html += "<div class='item-title-row'>";
                html += "<div class='item-title'><b># "+ pokemon.id + ": " + pokemon.name +"</b></div>";
                html += "</div>";
                html += "<div class='item-subtitle'>&nbsp;</div>";
                html += "<div class='item-text'><a ontouchend='freePokemon("+ pokemon.id +")' href='#' class='button button-fill color-red button-round'>Free</a></div>";
                html += "</div>";
                html += "</div>";
                html += "</li>";
                
                $("#mypokemons-list ul").append(html);
            }); 
        }
    } else if(page.name === 'detail') {
        myApp.showPreloader();
   }
});


$$(document).on('pageAfterAnimation', function(e) { //Na de pagina geladen wordt, zal dit uitgevoerd worden
    var page = e.detail.page;
    
    if(page.name === 'pokemons') {
        //alert(myPokemons.length);
    } else if(page.name === 'detail') {
        selectedPokemonId       = page.query.id; //SelectedPokemonId gelijk zetten aan de meegegeven id
        var selectedPokemon     = getPokemon(selectedPokemonId);
        navigator.geolocation.getCurrentPosition(onSuccess, onError); //
        setTimeout(function() {
            
            var distanceToPokemon   = getDistanceFromLatLonInMeters(selectedPokemon.latitude, selectedPokemon.longitude, myPosition.coords.latitude, myPosition.coords.longitude);
            
            //Pokemon info        
            htmlPokemonInfo = "";
            htmlPokemonInfo += "<div class='content-block-inner'>";
            htmlPokemonInfo += "<table style='width: 100%;'>";
            htmlPokemonInfo += "<tr>";
            htmlPokemonInfo += "<td rowspan='3' style='width: 120px; height: 120px;'>";
            htmlPokemonInfo += "<img src='"+ selectedPokemon.image +"' />";
            htmlPokemonInfo += "</td>";
            htmlPokemonInfo += "<td>";
            htmlPokemonInfo += "<b>";
            htmlPokemonInfo += selectedPokemon.name;
            htmlPokemonInfo += "</b>";
            htmlPokemonInfo += "</td>";
            htmlPokemonInfo += "<tr>";
            htmlPokemonInfo += "<td>";
            htmlPokemonInfo += "# " + selectedPokemon.id;
            htmlPokemonInfo += "</td>";
            htmlPokemonInfo += "</tr>";
            htmlPokemonInfo += "<tr>";
            htmlPokemonInfo += "<td>";
            selectedPokemon.types.forEach(function(type){
                htmlPokemonInfo += "<span class='sprite sprite-type_"+ type +"'></span>";
            });
            htmlPokemonInfo += "</td>";
            htmlPokemonInfo += "</tr>";
            htmlPokemonInfo += "</table>";
            htmlPokemonInfo += "</div>";
            $('#pokemonInfo').append(htmlPokemonInfo);      
            
            //Extra functions
            htmlPokemonExtraFunctions = "";
            htmlPokemonExtraFunctions += "<ul>";
            
            //Check of je de pokemon al hebt en of je dichtbij bent
            if(!hasPokemon(selectedPokemon.id)) {
                if(distanceToPokemon <= maxDistanceToPokemon || distanceToPokemon <= (maxDistanceToPokemon + myPosition.coords.accuracy)) {
                    htmlPokemonExtraFunctions += "<li><a href='#' id='catchPokemonButton' class='list-button item-link color-red' ontouchend='catchPokemon("+ selectedPokemon.id + ",\"" + selectedPokemon.name +" \");'>Catch</a></li>";
                }
            } else {
                htmlPokemonExtraFunctions += "<li><a href='#' id='catchPokemonButton' class='list-button item-link color-red disabled'>Catch</a></li>";
            }
            
            htmlPokemonExtraFunctions += "<li><a ontouchend=\"openExternalLink('"+ selectedPokemon.externalURL +"')\" href='#' class='list-button item-link'>Open in browser</a></li>";
            htmlPokemonExtraFunctions += "</ul>";
            $('#pokemonExtraFunctions').append(htmlPokemonExtraFunctions);
            
            
            //Extra info
            htmlPokemonExtraInfo = "";
            htmlPokemonExtraInfo += "<ul>";
            if(selectedPokemon.evolutions.length < 1) {
                htmlPokemonExtraInfo += "<li class='accordion-item disabled'>";
            } else {
                htmlPokemonExtraInfo += "<li class='accordion-item'>";
            }
            htmlPokemonExtraInfo += "<a href='#' class='item-content item-link'>";
            htmlPokemonExtraInfo += "<div class='item-inner'>";
            htmlPokemonExtraInfo += "<div class='item-title'>Evolution(s)</div>";
            htmlPokemonExtraInfo += "</div>";
            htmlPokemonExtraInfo += "</a>";
            htmlPokemonExtraInfo += "<div class='accordion-item-content'>";
            htmlPokemonExtraInfo += "<div class='content-block'>";
            htmlPokemonExtraInfo += "<ul>";
            selectedPokemon.evolutions.forEach(function(evolution){
                htmlPokemonExtraInfo += "<li>" + evolution + "</li>";
            });
            htmlPokemonExtraInfo += "</ul>";
            htmlPokemonExtraInfo += "</div>";
            htmlPokemonExtraInfo += "</div>";
            htmlPokemonExtraInfo += "</li>";
            htmlPokemonExtraInfo += "<li class='accordion-item'>";
            htmlPokemonExtraInfo += "<a href='#' class='item-content item-link'>";
            htmlPokemonExtraInfo += "<div class='item-inner'>";
            htmlPokemonExtraInfo += "<div class='item-title'>Moves(s)</div>";
            htmlPokemonExtraInfo += "</div>";
            htmlPokemonExtraInfo += "</a>";
            htmlPokemonExtraInfo += "<div class='accordion-item-content'>";
            htmlPokemonExtraInfo += "<div class='content-block'>";
            htmlPokemonExtraInfo += "<ul>";
            selectedPokemon.moves.forEach(function(move){
                htmlPokemonExtraInfo += "<li>" + move + "</li>";
            });
            htmlPokemonExtraInfo += "</ul>";
            htmlPokemonExtraInfo += "</div>";
            htmlPokemonExtraInfo += "</div>";
            htmlPokemonExtraInfo += "</li>";
            htmlPokemonExtraInfo += "</ul>";
            $('#pokemonExtraInfo').append(htmlPokemonExtraInfo);
            
            
            setTimeout(function() {
               myApp.hidePreloader(); 
            }, 2500);
            
        }, 5000); 
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