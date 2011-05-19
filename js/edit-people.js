
var selectedIndex = 0;
var IDs = null;
var Changes = {};
var Details = {};

var searchTerm = '';
var searchIndex = 0;
var searches = {};

$(function()
{
    $('#EditPeople').addClass('loading');
    
    $('#IDNav-fist').click(function(){select_index(0);});
    $('#IDNav-back').click(function(){select_index(selectedIndex-1);});
    $('#IDNav-next').click(function(){select_index(selectedIndex+1);});
    $('#IDNav-last').click(function(){select_index(IDs.length);});
    
    $('#IDNav-searchbox').change(search);
    $('#IDNav-search').click(search);
    
    $('#IDNav-insert').click(insert_person);
    $('#IDNav-delete').click(delete_person);
    
    $('#IDNav-save').click(save);
    
    $('#EditPeople table input').keyup(function()
    {
        if ( ! any_changes() ) { return; }
        Details[pid()] = get_new_details();
        Changes[pid()] = true;
        $('#EditPeople').addClass('modified');
    });
    $('#IDNav-id').keyup(function()
    {
        select_id($('#IDNav-id').val());
    });
    
    reload();
});



function reload()
{
    $('#EditPeople').addClass('loading');
    IDs = null;
    
    $.ajax({
        url: '/bewerken/json/IDs',
        dataType: 'json',
        success: function(data)
        {
            IDs = data;
            if ( location.hash.length > 1 )
            {
                select_id( location.hash.substr(1) );
            }
            else
            {
                select_index( IDs.length-1 );
            }
        }
    });
}



function pid()
{
    return IDs[selectedIndex];
}

function select_index( index )
{
    if ( ! IDs ) { return; }
    if ( IDs.length == 0 ) { return; }
    if ( index >= IDs.length ) { index = IDs.length - 1; }
    if ( index < 0 ) { index = 0; }
    
    selectedIndex = index;
    select_this();
}

function select_id( pers_id )
{
    if ( ! IDs ) { return; }
    for ( var i = 0; i < IDs.length; i++ )
    {
        if ( IDs[i] == pers_id )
        {
            selectedIndex = i;
            select_this();
            return;
        }
    }
}

function select_this()
{
    location.hash = pid();
    $('#IDNav-id').val(pid());
    
    if ( pid() in Details )
    {
        $('#EditPeople').removeClass('loading');
        update_fields();
    }
    else
    {
        $('#EditPeople').addClass('loading');
        load_details( pid() );
    }
    if ( pid() in Changes )
    {
        $('#EditPeople').addClass('modified');
    }
    else
    {
        $('#EditPeople').removeClass('modified');
    }
}

function load_details( pers_id )
{
    $.ajax({
        type: 'POST',
        url: '/bewerken/json/details',
        data: {'pers_id': pers_id},
        success: function(data)
        {
            var update = !( pid() in Details );
            for ( var i = 0; i < data.length; i++ )
            {
                r = data[i];
                p = r['pers_id'];
                if ( ! ( p in Details ))
                {
                    Details[p] = r;
                }
            }
            if (( update ) && ( pid() in Details ))
            {
                update_fields();
            }
        },
        dataType: 'json'
    });
}

function update_fields()
{
    if ( ! ( pid() in Details )) { alert("not anymore."); return; }
    var d = Details[pid()];
    
    $('#Field-Achternaam')       .val(d['achternaam']);
    $('#Field-Aangetrouwdenaam') .val(d['aangetrouwdenaam']);
    $('#Field-Voorletters')      .val(d['voorletters']);
    $('#Field-Voornaam')         .val(d['voornaam']);
    $('#Field-Tussenvoegsel')    .val(d['tussenvoegsel']);
    $('#Field-Titel')            .val(d['titel']);
    $('#Field-Geslacht')         .val(d['geslacht']);
    $('#Field-Adres')            .val(d['adres']);
    $('#Field-Postcode')         .val(d['postcode']);
    $('#Field-Plaats')           .val(d['plaats']);
    $('#Field-Land')             .val(d['land']);
    $('#Field-Post')             .val(d['post']);
    $('#Field-Telefoon')         .val(d['telefoon']);
    $('#Field-Mobiel')           .val(d['mobiel']);
    $('#Field-Email')            .val(d['email']);
    $('#Field-Geboortedatum')    .val(d['geboortedatum']);
    $('#Field-Sterftedatum')     .val(d['sterftedatum']);
    $('#Field-Banknummer')       .val(d['banknummer']);
    $('#Field-Tenaamstelling')   .val(d['tenaamstelling']);
    $('#Field-Nationaliteit')    .val(d['nationaliteit']);
    $('#Field-Voorkeurstaal')    .val(d['voorkeurstaal']);
    $('#Field-Opm')              .val(d['opm']);
    
    $('#EditPeople').removeClass('loading');
}

function get_new_details()
{
    var d = {};
    d['pers_id']            = pid();
    d['achternaam']         = $('#Field-Achternaam').val();
    d['aangetrouwdenaam']   = $('#Field-Aangetrouwdenaam').val();
    d['voorletters']        = $('#Field-Voorletters').val();
    d['voornaam']           = $('#Field-Voornaam').val();
    d['tussenvoegsel']      = $('#Field-Tussenvoegsel').val();
    d['titel']              = $('#Field-Titel').val();
    d['geslacht']           = $('#Field-Geslacht').val();
    d['adres']              = $('#Field-Adres').val();
    d['postcode']           = $('#Field-Postcode').val();
    d['plaats']             = $('#Field-Plaats').val();
    d['land']               = $('#Field-Land').val();
    d['post']               = $('#Field-Post').val();
    d['telefoon']           = $('#Field-Telefoon').val();
    d['mobiel']             = $('#Field-Mobiel').val();
    d['email']              = $('#Field-Email').val();
    d['geboortedatum']      = $('#Field-Geboortedatum').val();
    d['sterftedatum']       = $('#Field-Sterftedatum').val();
    d['banknummer']         = $('#Field-Banknummer').val();
    d['tenaamstelling']     = $('#Field-Tenaamstelling').val();
    d['nationaliteit']      = $('#Field-Nationaliteit').val();
    d['voorkeurstaal']      = $('#Field-Voorkeurstaal').val();
    d['opm']                = $('#Field-Opm').val();
    
    return d;
}


function any_changes()
{
    var ould = Details[pid()];
    var nehw = get_new_details();
    for ( i in nehw )
    {
        if ( ould[i] != nehw[i] ) { return true; }
    }
    return false;
}


function save()
{
    for ( i in Changes )
    {
        $.ajax({
            type: 'POST',
            url: '/bewerken/json/wijzig',
            data: Details[i],
            success: function(data)
            {
                delete Changes[i];
                //alert(data);
                if ( pid() == i )
                {
                    $('#EditPeople').removeClass('modified');
                }
            },
            dataType: 'html'
        });
    }
}



function insert_person()
{
    if ( !IDs ) { return; }
    $.ajax({
        type: 'POST',
        url: '/bewerken/json/invoegen',
        data: {'failsafe': 'ja'},
        success: function(data)
        {
            if ( ! data ) { alert("Invoegen ging mis. Sorry."); return; }
            //alert(data);
            IDs[IDs.length] = data;
            select_index(IDs.length-1);
        },
        dataType: 'json'
    });
}
function delete_person()
{
    if ( !confirm('Weet je het zeker?') ) { return; }
    if ( !confirm('Het verwijderen van personen is doorgaans niet de bedoeling. \n' + 
                  'Waarschijnlijk volstaat het om deze persoon uit te schrijven bij alle groepen.\n' +
                  'Weet je echt zeker dat je deze persoon COMPLEET WILT WISSEN?') ) { return; }
    if ( !confirm('Ik vraag het nog één keer. \n'+
                  'Weet je het echt echt zeker?') ) { return; }
    $.ajax({
        type: 'POST',
        url: '/bewerken/json/verwijderen',
        data: {'pers_id': pid(), 'weetjehetzeker': 'ja'},
        success: function(data)
        {
            if (data)
            {
                location.hash = '';
                reload();
            }
        },
        dataType: 'json'
    });
}



function search()
{
    var nst = $('#IDNav-searchbox').val();
    if ( nst == searchTerm ) { search_next(); return; }
    searchTerm = nst;
    search_this();
}
function search_next()
{
    var s = searches[searchTerm];
    if ( !s || ( s.length == 0 )) { return; }
    searchIndex++;
    if ( searchIndex >= s.length ) { searchIndex = 0; }
    
    select_id( s[searchIndex] );
}
function search_this()
{
    var st = searchTerm;
    //alert('Searching for ['+st+'].');
    $.ajax({
        type: 'POST',
        url: '/bewerken/json/zoek',
        data: {'term': st},
        success: function(data)
        {
            //alert( 'Data for ['+st+']: '+data )
            searches[st] = data;
            searchIndex = -1;
            search_next();
        },
        dataType: 'json'
    });
}
