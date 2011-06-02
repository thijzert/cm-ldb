<?php


require_once( 'inc/db.inc' );
require_once( 'inc/parameters/base.inc' );

class QueryParameters
{
    static function protected_param_names()
    {
        return array('query');
    }
    
    
    private static $_types = array();
    static function add_type( $name, Parameters\Base $pc )
    {
        # TODO: Iets met duplicaten.
        QueryParameters::$_types[ $name ] = $pc;
    }
    
    
    
    static function process( Query $Q )
    {
        $params = $Q->Parameters;
        $ppn = QueryParameters::protected_param_names();
        
        if ( count($params) == 0 ) { return array(); }
        
        $rv = array();
        
        foreach ( $params as $name=>$paramspec )
        {
            if ( in_array($name,$ppn) )
            {
                throw new Exception( "Parameter name [{$name}] is reserved.  Query: " . $Q->file );
            }
            
            if ( array_key_exists($name, $_REQUEST) )
            {
                $rv[$name] = $_REQUEST[$name];
                continue;
            }
        }
        
        # Controleer of er genoeg informatie is
        if ( count($rv) == count($params) ) { return $rv; }
        
        # Zoniet, maak een mooi formuliertje voor elke parameter.
        ?><!DOCTYPE html>
<html>
    <head>
        <title><?=$Q->Title?></title>
        
        <link type="text/css" href="/css/common.css" rel="stylesheet" />	
        <link type="text/css" href="/css/humanity/jquery-ui-1.8.12.custom.css" rel="stylesheet" />	
		<script type="text/javascript" src="/js/jquery-1.5.1.min.js"></script>
		<script type="text/javascript" src="/js/jquery-ui-1.8.12.custom.min.js"></script>
<?php
        include('inc/parameters/string.inc');
        include('inc/parameters/integer.inc');
        include('inc/parameters/datetime.inc');
        include('inc/parameters/pick.inc');
?>
    </head>
    <body>
        <h1><?=$Q->Title?></h1>
        <form method="get" action="<?=$_SERVER["REQUEST_URI"]?>"

<?php
        foreach ( $params as $name=>$paramspec )
        {
            $handler = @QueryParameters::$_types[$paramspec['type']];
            if ( $handler )
            {
                $handler->form( $name, $paramspec, @$rv[$name] );
            }
            else
            {
                print( "<p>Ik heb een parameter [$name] gevonden van type [{$paramspec['type']}], ".
                       "en ik heb geen flauw idee wat ik er mee moet.</p>\n" );
            }
        }
?>
            <p>
                <input type="submit" value="Query uitvoeren" />
            </p>
        </form>
    </body>
</html><?php
        exit;
        
    }
}
