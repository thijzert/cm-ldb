<?php


require_once( "inc/adapters/persoon.inc" );

//header( "Content-type: text/plain" );

//$PA = Adapters\Persoon::IDs();
//$IDs = $PA->execute(array());


if ( ! isset($_GET["json"]) )
{
    include( "edit-people.html" );
    exit;
}


header( "Content-type: text/plain" );

if ( $_GET["json"] == "IDs" )
{
    $PA = Adapters\Persoon::IDs();
    $IDs = $PA->execute(array());
    print( "[" );
    foreach ( $IDs as $i=>$r )
    {
        if ( $i ) { print(","); }
        print $r["pers_id"];
    }
    print( "]" );
}
elseif (( $_GET["json"] == "details" ) && ( is_numeric(@$_REQUEST["pers_id"]) ))
{
    $Detail = Adapters\Persoon::Detail();
    $Ds = $Detail->execute(array('persoon'=>$_REQUEST["pers_id"]));
    print(json_encode($Ds));
}
else
{
    print "null";
}
