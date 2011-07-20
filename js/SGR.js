
var SGR = {
    
    timer: null,
    
    load: function( pers_id )
    {
        $("td.special_label ul").html('');
        $("td.special_label").addClass('loading');
        if ( SGR.timer ) { clearTimeout( SGR.timer ); }
        
        // Check if the selected person is already in the cache
        if ((pid() in SGR.Studie.cache)&&(pid() in SGR.Groep.cache)&&(pid() in SGR.Relatie.cache))
        {
            SGR.loaded();
        }
        else
        {
            SGR.timer = setTimeout(function(){SGR.actually_load(pers_id);}, 300 );
        }
    },
    
    actually_load: function( pers_id )
    {
        $.ajax({
            type: 'GET',
            url: '/bewerken/json/SGR',
            data: {'pers_id': pers_id},
            success: function(data)
            {
                SGR.Studie.cache[pers_id] = data["studies"];
                SGR.Groep.cache[pers_id] = data["groepen"];
                SGR.Relatie.cache[pers_id] = data["relaties"];
                
                if ( pid() == pers_id ) { SGR.loaded(); }
            },
            dataType: 'json'
        });
    },
    loaded: function()
    {
        if (!((pid() in SGR.Studie.cache)&&(pid() in SGR.Groep.cache)&&(pid() in SGR.Relatie.cache)))
        { alert( "Not found!" ); return; }
        
        $.map( SGR.Studie.cache[pid()],  SGR.Studie.append );
        $.map( SGR.Groep.cache[pid()],   SGR.Groep.append );
        $.map( SGR.Relatie.cache[pid()], SGR.Relatie.append );
        
        $("td.special_label").removeClass('loading');
        
    },
    append_relatie: function( relatie )
    {
        var opid = relatie["pers_id"];
        var li = '<li>';
        var types = {partner:'Partner',ouder:'Ouder',kind:'Kind',anders:'Kennis'};
        li = $('<li>' + types[relatie["relatie"]] + ' van ' + Naam.van(opid) + '</li>');
        li.click(function(){alert(JSON.stringify(relatie));});
        $("#Relaties ul").append(li);
    },
    
    
    Studie: {
        fmt: function( studie )
        {
            return studie["studienaam"] + ( studie["afgestudeerd"] > 0 ? ' (A)' : '' );
        },
        key: function( studie )
        {
            if ( studie == null ) { return null; }
            return {
                studie_id: studie["studie_id"],
                afgestudeerd: studie["afgestudeerd"]
            };
        },
        get_fields: function()
        {
            return {
                studie_id: $("#StudieEditor #studie_id").val(),
                studienaam: $("#StudieEditor #studie_id :selected").html(),
                afgestudeerd: ( $("#StudieEditor #afgestudeerd").attr('checked') ? 1 : 0 )
            };
        },
        set_fields: function( studie )
        {
            $("#StudieEditor #studie_id").val(studie["studie_id"]);
            $("#StudieEditor #afgestudeerd").attr('checked', ( studie["afgestudeerd"] > 0 ) );
        }
    },
    
    Groep: {
        fmt: function( groep )
        {
            return groep["klasse"]+' : '+groep["groepsnaam"]+
                ' ('+groep["van"].substr(0,4)+'-'+
                (groep["tot"]?groep["tot"].substr(0,4):'heden')+')';
        },
        key: function( groep )
        {
            //alert( JSON.stringify(groep) );
            if ( groep == null ) { return null; }
            
            var zero = function( str )
            {
                if ( str == null ) { return null; }
                if ( typeof(str.length) == 'undefined' ) { return str; }
                if ( str.length == 0 ) { return null; }
                if ( str.substr(0,4) == "0000" ) { return null; }
                return str;
            }
            
            return {
                groep_id: groep.groep_id,
                van: zero( groep.van ),
                tot: zero( groep.tot )
            };
        },
        get_fields: function()
        {
            return {
                groep_id: $("#GroepenEditor #groep_id").val(),
                klasse: $("#GroepenEditor #groep_id :selected").attr('data-klasse'),
                groepsnaam: $("#GroepenEditor #groep_id :selected").html(),
                van: $("#GroepenEditor #van").val(),
                tot: $("#GroepenEditor #tot").val()
            };
        },
        set_fields: function( groep )
        {
            $("#GroepenEditor #groep_id").val(groep["groep_id"]);
            $("#GroepenEditor #van").val(groep["van"]);
            $("#GroepenEditor #tot").val(groep["tot"]);
        }
    },
    
    Relatie: {
        types: {partner:'Partner',ouder:'Ouder',kind:'Kind',anders:'Kennis'},
        fmt: function( rel )
        {
            var opid = rel["pers_id"];
            return SGR.Relatie.types[rel["relatie"]] + ' van ' + Naam.van(opid);
        },
        key: function( rel )
        {
            return rel;
        },
        get_fields: function()
        {
            return {
                pers_id: SGR.Relatie.actual_actual_pers_id,
                relatie: $("#RelatieEditor #type").val()
            };
        },
        set_fields: function( rel )
        {
            $("#RelatieEditor #pers_id_b").val( Naam.van( rel["pers_id"] ) );
            $("#RelatieEditor #type").val( rel["relatie"] );
        },
        actual_actual_pers_id: 0
    },
    
    save: function()
    {
        var trans = escape(JSON.stringify({
            studies: SGR.Studie.transaction,
            groepen: SGR.Groep.transaction,
            relaties: SGR.Relatie.transaction
        }));
        
        $.ajax({
            type: 'POST',
            url: '/bewerken/json/wijzig-SGR',
            data: {transaction: trans},
            success: function(data)
            {
                SGR.Studie.transaction = [];
                SGR.Groep.transaction = [];
                SGR.Relatie.transaction = [];
                if ( data.length > 0 ) { alert(data); }
            },
            dataType: 'html'
        });
    }
};

create_slc( "#Secties", SGR.Groep, "#GroepenEditor", "Bewerk groep" );
create_slc( "#Studies", SGR.Studie, "#StudieEditor", "Bewerk studie" );
create_slc( "#Relaties", SGR.Relatie, "#RelatieEditor", "Bewerk relatie" );

