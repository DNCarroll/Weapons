using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BattleAxe
{
    public static class JsonSerialize
    {
        //the client isnt using IBattleAxe not sure that is feasible would have to reference the BattleAxe

        //presume that uses IBattleAxe
        //this gives you access to the indexer which makes life simplier

        //cache info about the objects
        //on write reflect first time out to learn about the object? must have public set method
        //if uses interface then might expect a list of serializable properties

        //on read reflect first time out to learn about the object? must have public get method
        //if uses interface then might expect a list of items that can be read
    }


    //BattleAxe.Compiler, BattleAxe.Data, BattleAxe.Serialize as separate dlls?
    //only reason to be intested in the indexer for serialization is if talking about speed or dynamic object that is being routed
    //through to the server or coming from the server
    //several things in the compiler where not available to the windows store apps so doing on the fly compile is not feasible
    //so this setting through those methods isnt something that we can do
    //future use extension method to avail the indexer?

}
