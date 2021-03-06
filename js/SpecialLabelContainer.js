/*
    Copyright (C) 2011 Thijs van Dijk
    
    This file is part of CM-LDB.

    CM-LDB is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    CM-LDB is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with CM-LDB.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
   Creates a SpecialLabelContainer.
*/


function create_slc( container, CC, editor, title )
{
    CC.current = null;
    CC.transaction = [];
    CC.cache = [];
    
    CC.append = function( groep )
    {
        var li = $('<li>'+CC.fmt(groep)+'</li>');
        
        li.click(function(){
            CC.edit( groep, $(this) );
        });
        
        $(container + " ul").append(li);
        var ct = $(container + " ul").children("li").length;
        $(container).prev().find("span").html("(" + ct + ")");
    };
    
    CC.addnew = function()
    {
        CC.edit( null, null );
    };
    
    CC.edit = function( groep, li )
    {
        $(editor).dialog({
            title: title,
            modal: true,
            width: 500
        });
        
        CC.current = [ groep, li ];
        if ( groep )
        {
            CC.set_fields( groep );
        }
        else
        {
            $(editor + " .resetable").val(null);
            $(editor + " .uncheckable").attr('checked',false);
        }
    };
    
    CC.change = function( new_groep )
    {
        var key = CC.key( CC.current[0] );
        var ng = CC.key( new_groep );
        var c = CC.cache[pid()];
        
        if ( duck_compare( key, ng ) ) { return; }
        
        CC.transaction.push( [pid(), key, ng] );
        CC.current[0] = new_groep;
        
        
        if ( key == null )
        {
            c.push( new_groep );
            CC.append( new_groep );
            return;
        }
        
        
        if ( ng == null )
        {
            // Remove the item from the cache
            for ( var i = 0; i < c.length; i++ )
            {
                if ( !duck_compare( key, c[i] ) ) { continue; }
                c.splice( i, 1 );
                break;
            }
            // Remove the item from the DOM
            if ( CC.current[1] )
            {
                CC.current[1].remove();
            }
        }
        else
        {
            // Modify the cache
            for ( var i = 0; i < c.length; i++ )
            {
                if ( !duck_compare( key, c[i] ) ) { continue; }
                c[i] = new_groep;
                break;
            }
            // Set the new text
            CC.current[1].html(CC.fmt(CC.current[0]));
        }
    };
    
    if ( !( "fmt" in CC ) || !( "key" in CC ) ||
        !( "get_fields" in CC ) || !( "set_fields" in CC ) )
    {
        throw "Code container does not have required functions" +
            "fmt(), key(), get_fields(), and set_fields().";
    }
    
    
    $(function()
    {
        
        // Create buttons, place everything in a nested <div>, and generate
        // an <ul> below.
        var div = $('<div class="grid_3" />');
        div.html($(container).html());
        $(container).html('').append(div);
        
        var buttons = $('<div class="buttons grid_3" />');
        div.append(buttons);
        
        buttons.append("<div>add</div>").click(CC.addnew);
        
        $(container).append('<ul class="grid_8" />');
        
        var invalidate = function()
        {
            Changes[pid()] = true;
            $('#EditPeople').addClass('modified');
        }
        
        
        // Set correct click events on the editor dialog.
        $(editor + " #save").click(function()
        {
            new_groep = CC.get_fields( editor );
            CC.change( new_groep );
            invalidate();
            
            $(editor).dialog("close");
        });
        
        $(editor + " #delete").click(function()
        {
            if ( confirm( "Weet je zeker dat je dit item wilt verwijderen?\n" +
                          "Dit is waarschijnlijk niet wat je wil.") )
            {
                CC.change( null );
                invalidate();
                
                $(editor).dialog("close");
            }
        });
    });
}




function duck_compare( A, B )
{
    // Perform a shallow comparison of dict's A and B. Returns true if they're
    // ostensibly equal.
    
    if (( A == null ) && ( B == null )) { return true; }
    if (( A == null ) || ( B == null )) { return false; }
    
    for ( i in A )
    {
        if (( ! ( i in B ) ) || ( A[i] != B[i] )) { return false; }
    }
    return true;
}

