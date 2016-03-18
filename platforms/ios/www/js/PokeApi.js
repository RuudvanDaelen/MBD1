/**
 * Created by Ruud on 3-2-2016.
 */

 function search() {
 	var searchValue = document.getElementById("searchbar").value;
 	if(searchValue != "") {
 		var url = "http://pokeapi.co/api/v2/pokemon/"+searchValue.toLowerCase();

 		$.ajax({url: url, success: function(pokemon){
    		alert(pokemon.id + " : " +pokemon.name)
    	}});
 	}
 }

function createPokemonList() {

	var pokemonResult = [];

	$.ajax({url: "http://pokeapi.co/api/v2/pokemon/", success: function(result){
        //alert(result);
        var x = 1;

        for(var id in result) {
        	if(id < 10) {
        		//alert(result[id].name + " : " + result[id].url);

        		var pokemon = { "id" : x, "name" : result[id].name, "url" : result[id].url };
        		//alert(pokemon.name + " : " + pokemon.url);
        		//pokemonResult.push(result[id]);


        		html = "";

				html += "<li>";
			    	html += "<a href='#"+pokemon.url+"'>";
				    	html += "<img src='http://pokeapi.co/media/img/"+pokemon.id+".png'>";
				    	html += "<h2>"+pokemon.name+"</h2>";
				    	html += "<p>#"+pokemon.id+"</p>";
			    	html += "</a>";
			    html += "</li>";

			    $("#pokemon-list").append(html);

				x++;
        	}
        }
    }});	
}


/*

for (var i = 0; i <= 10; i++) {
	    	html = "";

			html += "<li>";
		    html += "<a href='#'>";
		    html += "<img src='chrome.png'>";
		    html += "<h2>Pokemon naam</h2>";
		    html += "<p>#nummer</p>";
		    html += "</a>";
		    html += "</li>";

		    $("#pokemon-list").append(html);



*/