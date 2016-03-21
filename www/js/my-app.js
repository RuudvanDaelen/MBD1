// Initialize your app
var myApp = new Framework7();

// Export selectors engine
var $$ = Dom7;


//Infinite scroll variables
var loading = false;
var lastIndex = $$('.pokemon-list li').length; //Zal na infinite scroll hoger worden
var maxItems = 811; //moet gezet worden met ajaxcall result.count (totaal aantal van pokemons)
var itemsPerLoad = $('#pokemonsToLoad').val(); //instellbaar met settings
$('#itemsPerLoad').text(itemsPerLoad);
//var next = "http://pokeapi.co/api/v2/pokemon/?limit=20";//+itemsPerLoad; NIET MEER NODIG



// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});


//Wordt direct uitgevoerd wanneer my-app.js wordt geladen in de pagina
loadPokemons(itemsPerLoad, 0); //vanaf het begin

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


//Pokemons laden
function loadPokemons(limit, offset) {
    
    var url = "http://pokeapi.co/api/v2/pokemon/?limit="+limit+"&offset="+offset;
    
    $.ajax({url: url, success: function(result){
        //alert("Aantal pokemons: " + result.count + "\n" + result.next);

        //Zet maxItems voor infinite scroll
        maxItems    = result.count; //Zet het maximaal aantal items dat geladen kan worden gelijk aan t aantal pokemons dat er zijn
        next        = result.next;  //Zet de volgende url gelijk aan de next

        $.each(result.results, function(i, item) {
            //var pokemonItem = { name : item.name, href: item.url }

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
            //alert(pokemon.id + ": " + pokemon.name + ": " + pokemon.href + ": " + pokemon.image);

            var html = "<li>";
                    html += "<a href='detail.html' class='item-link item-content'>";
                        html += "<div class='item-media'>";
                            html += "<img height='88px' width='88px' src='"+ pokemon.image +"'>";
                        html += "</div>";
                        html += "<div class='item-inner'>";
                            html += "<div class='item-title-row'>";
                                html += "<div class='item-title'>"+ pokemon.name +"</div>";
                                //html += "<div class='item-after'>details</div>";
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

//ItemsToLoad setten
function setItemsPerLoad(value) {
    itemsPerLoad = value;
    $('#itemsPerLoad').text(itemsPerLoad);
}