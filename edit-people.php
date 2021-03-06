<?php

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
   JSON bindings for the edit page.
*/


require_once( "inc/adapters/persoon.inc" );
require_once( "inc/adapters/SGR.inc" );

//header( "Content-type: text/plain" );

//$PA = Adapters\Persoon::IDs();
//$IDs = $PA->execute(array());


function Groepen()
{
    $DA = Adapters\SGR::Groepen();
    $g = $DA->execute();
    $klasse = false;
    $rv = "\n";
    foreach ( $g as $groep )
    {
        if ( $groep["klasse"] != $klasse )
        {
            if ( $klasse ) { print( "                    </optgroup>\n" ); }
            $klasse = $groep["klasse"];
            $rklasse = htmlspecialchars($klasse);
            print( "                    <optgroup label=\"".ucfirst($rklasse)."\">\n" );
        }
        $rgn = htmlspecialchars($groep["groepsnaam"]);
        print( "                        <option value=\"{$groep["groep_id"]}\" data-klasse=\"{$rklasse}\">{$rgn}</option>\n" );
    }
    if ( $klasse ) { print( "                    </optgroup>\n" ); }
}
function Studies()
{
    $DA = Adapters\SGR::Studies();
    $s = $DA->execute();
    $rv = "\n";
    foreach ( $s as $studie )
    {
        $sn = htmlentities(ucfirst( $studie["studienaam"] ));
        $rv .= "                        <option value=\"{$studie["studie_id"]}\"\">{$sn}</option>\n";
    }
    return $rv . "                    ";
}



if ( ! isset($_GET["json"]) )
{
    header( "Content-type: text/html;charset=UTF-8" );
    include( "inc/templates/edit-people.html" );
    exit;
}


function print_pers_ids( $array )
{
    print( "[" );
    foreach ( $array as $i=>$r )
    {
        if ( $i ) { print(","); }
        print $r["pers_id"];
    }
    print( "]" );
}


header( "Content-type: text/plain;charset=UTF-8" );

if ( $_GET["json"] == "IDs" )
{
    $PA = Adapters\Persoon::IDs();
    print_pers_ids( $PA->execute(array()) );
}
elseif (( $_GET["json"] == "namen" ) && ( is_numeric(@$_REQUEST["pers_id"]) ))
{
    $PA = Adapters\Persoon::Namen();
    $args = array( 'pers_id'=>$_REQUEST["pers_id"] );
    if ( is_numeric(@$_REQUEST["dist"]) ) { $args["dist"] = $_REQUEST["dist"]; }
    print(json_encode($PA->execute( $args )));
}
elseif (( $_GET["json"] == "personpick" ) && ( isset($_REQUEST["q"]) ))
{
    $PA = Adapters\Persoon::PersonPick();
    $args = array( 'q'=>$_REQUEST["q"] );
    print(json_encode($PA->execute( $args )));
}
elseif (( $_GET["json"] == "details" ) && ( is_numeric(@$_REQUEST["pers_id"]) ))
{
    $Detail = Adapters\Persoon::Detail();
    $Ds = $Detail->execute(array('pers_id'=>$_REQUEST["pers_id"]));
    print(json_encode($Ds));
}
elseif (( $_GET["json"] == "zoek" ) && ( isset($_REQUEST["term"]) ))
{
    $Search = Adapters\Persoon::Search();
    $IDs = $Search->execute(array('term'=>$_REQUEST["term"]));
    print_pers_ids( $IDs );
}
elseif (( $_GET["json"] == "wijzig" ) && ( is_numeric(@$_POST["pers_id"]) ))
{
    $Modify = Adapters\Persoon::Modify();
    $args = array();
    foreach ( $Modify->mandatory_args() as $arg )
    {
        $args[$arg] = @$_POST[$arg];
    }
    $Ds = $Modify->execute($args);
    print( is_array($Ds) ? 'true' : 'false' );
}
elseif (( $_GET["json"] == "invoegen" ) && ( isset($_POST["failsafe"]) ))
{
    $I = Adapters\Persoon::Insert();
    $I->execute();
    print DB::rw()->insert_id();
}
elseif ( $_GET["json"] == "verwijderen" )
{
    $D = Adapters\Persoon::Delete();
    $ar = $D->execute(array('pers_id'=>@$_POST['pers_id'],'weetjehetzeker'=>@$_POST['weetjehetzeker']));
    print ( is_array($ar) ? 'true' : 'false' );
}
elseif ( $_GET["json"] == "nieuwe-studie" )
{
    $DA = Adapters\SGR::nieuwe_studie();
    if ( !$DA || strlen(@$_REQUEST["studienaam"]) < 3 )
    {
        print(0);
        exit;
    }
    
    $DA->execute( array( 'studienaam' => $_REQUEST["studienaam"] ) );
    print( DB::rw()->insert_id() );
}
elseif ( $_GET["json"] == "SGR" )
{
    $DA = Adapters\SGR::Load();
    $rv = $DA->execute(array('pers_id'=>$_REQUEST["pers_id"]));
    print( json_encode($rv) );
}
elseif ( $_GET["json"] == "wijzig-SGR" )
{
    $transaction = json_decode( urldecode($_REQUEST["transaction"]), true );
    
    $DS = Adapters\SGR::delete_Studies();
    $IS = Adapters\SGR::insert_Studies();
    $US = Adapters\SGR::update_Studies();
    
    $DG = Adapters\SGR::delete_Groepen();
    $IG = Adapters\SGR::insert_Groepen();
    $UG = Adapters\SGR::update_Groepen();
    
    $DR = Adapters\SGR::delete_Relaties();
    $IR = Adapters\SGR::insert_Relaties();
    
    function valid_studie( $studie )
    {
        if ( !is_array($studie) ) { return false; }
        if ( !is_numeric( @$studie["studie_id"] ) ) { return false; }
        if ( !is_numeric( @$studie["afgestudeerd"] ) ) { return false; }
        return true;
    }
    function valid_groep( $groep, $check_tot=false )
    {
        if ( !is_array($groep) ) { return false; }
        if ( !is_numeric(@$groep["groep_id"]) ) { return false; }
        if ( !preg_match(DATE_REGEX,@$groep["van"])) { return false; }
        if ( $check_tot )
        {
            if (( @$groep["tot"] !== null ) && !preg_match(DATE_REGEX,@$groep["tot"]) ) { return false; }
        }
        return true;
    }
    function valid_relatie( $rel )
    {
        if ( $rel === null ) { return true; }
        return ( is_numeric($rel['pers_id']) &&
            in_array($rel['relatie'],array('ouder','kind','partner','anders')) );
    }
    
    foreach ( $transaction["studies"] as $X )
    {
        list($pers_id, $voor, $na) = $X;
        
        if ( ! is_numeric($pers_id) ) { continue; }
        if ( $voor === null )
        {
            if ( !valid_studie($na) ) { continue; }
            
            $IS->execute(array('pers_id'=>$pers_id,'studie_id'=>$na["studie_id"],
                'afgestudeerd'=>( $na["afgestudeerd"] > 0 ? 'ja' : 'neen' )));
        }
        elseif ( $na === null )
        {
            if ( !valid_studie($voor) ) { continue; }
            
            $DS->execute(array('pers_id'=>$pers_id,'studie_id'=>$voor["studie_id"]));
        }
        else
        {
            if ( !valid_studie($na) ) { continue; }
            if ( !valid_studie($voor) ) { continue; }
            
            $US->execute(array('pers_id'=>$pers_id,
                'studie_id'=>$voor["studie_id"], 'n_studie_id'=>$na["studie_id"],
                'n_afgestudeerd'=>( $na["afgestudeerd"] > 0 ? 'ja' : 'neen' )));
        }
    }
    foreach ( $transaction["groepen"] as $X )
    {
        list($pers_id, $voor, $na) = $X;
        
        if ( ! is_numeric($pers_id) ) { continue; }
        if ( $voor === null )
        {
            if ( !valid_groep($na,true) ) { continue; }
            
            $IG->execute(array('pers_id'=>$pers_id,'groep_id'=>$na["groep_id"],'van'=>$na["van"],'tot'=>$na["tot"]));
        }
        elseif ( $na === null )
        {
            if ( !valid_groep($voor,false) ) { continue; }
            
            $DG->execute(array('pers_id'=>$pers_id,'groep_id'=>$voor["groep_id"],'van'=>$voor["van"]));
        }
        else
        {
            if ( !valid_groep($na,true) ) { continue; }
            if ( !valid_groep($voor,false) ) { continue; }
            
            $UG->execute(array('pers_id'=>$pers_id,'groep_id'=>$voor["groep_id"],'van'=>$voor["van"],
                'n_groep_id'=>$na["groep_id"],'n_van'=>$na["van"],'n_tot'=>$na["tot"]));
        }
    }
    foreach ( $transaction["relaties"] as $X )
    {
        list($pers_id, $voor, $na) = $X;
        if ( ! is_numeric($pers_id) ) { continue; }
        if ( (!valid_relatie($voor)) || (!valid_relatie($na)) ) { continue; }
        
        if ( $voor !== null )
        {
            $DR->execute(array('pers_id_1'=>$pers_id,'pers_id_2'=>$voor['pers_id']));
        }
        if ( $na !== null )
        {
            $rt = $na['relatie'];
            if ( $rt == 'kind' )
            {
                $IR->execute(array('pers_id_1'=>$na['pers_id'],'pers_id_2'=>$pers_id,'relatie'=>'ouder'));
            }
            else
            {
                $IR->execute(array('pers_id_1'=>$pers_id,'pers_id_2'=>$na['pers_id'],'relatie'=>$rt));
            }
        }
    }
}
else
{
    print "Onbekend JSON-object. Sorry.";
}
