import { Field, ObjectType } from "type-graphql";
import { Stats } from "./Stats";
import { PrimaryStatus, Status } from "./Status";
import { Pokemon } from "./Pokemon";
import { PokemonSpecies } from "./PokemonSpecies";

@ObjectType()
export class PokemonInBattle {
    @Field(() => Pokemon, { name: "pokemon" })
    protected _pokemon!: Pokemon;

    @Field(() => Status, { name: "status" })
    protected _status: Status = new Status();

    @Field(() => Number, { name: "remainingHealth" })
    protected _remainingHealth!: number;

    @Field(() => Boolean, { name: "isActive" })
    protected _isActive: boolean = false;

    @Field(() => Stats, { name: "statStages" })
    protected _statStages!: Stats;

    public get pokemon(): Pokemon {
        return this._pokemon;
    }
    public set pokemon(value: Pokemon) {
        this._pokemon = value;
    }

    public get status(): Status {
        return this._status;
    }
    public set status(value: Status) {
        this._status = value;
    }

    public get remainingHealth(): number {
        return this._remainingHealth;
    }
    public set remainingHealth(value: number) {
        this._remainingHealth = value;
    }

    public get isActive(): boolean {
        return this._isActive;
    }
    public set isActive(value: boolean) {
        this._isActive = value;
    }

    public get statStages(): Stats {
        return this._statStages;
    }
    public set statStages(value: Stats) {
        this._statStages = value;
    }

    constructor(pokemon:Partial<PokemonInBattle> | null = null) {
        if(pokemon) {
        Object.assign(this,pokemon);
        }
    }

    isFainted() {
        return this.status.primary = PrimaryStatus.Faint;
    }

    // gets the name if its not a ref
        getName() {
            if(this.pokemon?.pokemonSpecies instanceof String ) {
                return this.pokemon?.pokemonSpecies
            }
            else {
                const species = this.pokemon?.pokemonSpecies as PokemonSpecies;
                return species.name;
            }
        }

    getId():string {
        const id =  this.pokemon?._id?.toString() && "";
        return id ?? "";
    }

   
}





