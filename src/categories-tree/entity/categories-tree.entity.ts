import {PrimaryGeneratedColumn, Column, Entity} from "typeorm";
@Entity()
export class CategoriesTreeEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    json: string;
}