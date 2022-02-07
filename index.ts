import os = require('os');
import fs = require('fs');

// Définition des constantes et variables générales
const cliProgress = require('cli-progress');
const dossierRacine:string = `E:\\TESTSBPOVH`;

// Création de la progress bar avec le shades_classic theme
const progressBarFichiers = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

// Définition de Fonctions
function extractDate(str:string):string[] {
    let tab:string[]=[];
    let annee:string=str.substring(3, 7);
    let mois:string=str.substring(7, 9);
    let jour:string=str.substring(9, 11);
    let heures:string=str.substring(11, 13);
    let minutes:string=str.substring(13, 15);
    tab[0] = `${jour}/${mois}/${annee}`;
    tab[1] = `${heures}:${minutes}:00`;    
    return tab;
}

function extractTimeDL(cheminFichier:string):string {
    const monFichier = fs.readFileSync(cheminFichier);
    //const indexDebut = monFichier.indexOf('M=')+2;
    const indexDebut = monFichier.lastIndexOf('=')+1;
    // au max je récupère 9 caractères ex : 11h55m35s
    const indexfin = indexDebut+9;

    if (indexDebut == 0) {
        // on a pas trouvé la chaîne M= donc bug dans le download
        return 'erreur';
    }
    else return monFichier.slice(indexDebut, indexfin).toString();
}

function calcSecondes(str:string):string {
    if (str == 'erreur') {
        // on est dans un cas de bug dans le download
        return 'erreur';
    }
    else
    {
        const index_sec = str.indexOf('s');
        const index_h = str.indexOf('h');
        const index_mn = str.indexOf('m');
        let result:string='0';
        let h:number=0;
        let mn:number=0;
        let sec:number=0;
        if ((index_h != -1) && (index_mn == -1) && (index_sec == -1)) {
            // On a seulement des heures à comptabiliser
            h = Number(str.slice(0, index_h));
         };
         if ((index_h == -1) && (index_mn != -1) && (index_sec == -1)) {
            // On a seulement des minutes à comptabiliser
            mn = Number(str.slice(0, index_mn));
        };
        if ((index_h == -1) && (index_mn == -1) && (index_sec != -1)) {
            // On a seulement des secondes à comptabiliser
            sec = Number(str.slice(0, index_sec));
        };
        if ((index_h != -1) && (index_mn != -1) && (index_sec == -1)) {
           // On a des heures et des minutes à comptabiliser mais pas de secondes
           h = Number(str.slice(0, index_h));
           mn = Number(str.slice(index_h+1, index_mn));
        };
        if ((index_h != -1) && (index_mn == -1) && (index_sec != -1)) {
            // On a des heures et des secondes à comptabiliser mais pas de minutes
            h = Number(str.slice(0, index_h));
            sec = Number(str.slice(index_h+1, index_sec));
         };
        if ((index_h == -1) && (index_mn != -1) && (index_sec != -1)) {
            // On a des minutes et des secondes à comptabiliser mais pas d'heures
            mn = Number(str.slice(0, index_mn));
            sec = Number(str.slice(index_mn+1, index_sec));
         };
         if ((index_h != -1) && (index_mn != -1) && (index_sec != -1)) {
            // On a tout, des heures, des minutes et des secondes à comptabiliser
            h = Number(str.slice(0, index_h));
            mn = Number(str.slice(index_h+1, index_mn));
            sec = Number(str.slice(index_mn+1, index_sec));
         };
        //console.log(`H: ${h.toString()}, Mn: ${mn.toString()}, Sec: ${sec.toString()}`);
        result = ((h * 3600) + (mn * 60) + sec).toString();
        return result;
    };
}

// Programme principal

let dossiers = fs.readdirSync(dossierRacine, {withFileTypes:true});
let nbDossiers:number = 0;

// D'abord je supprime les anciens fichiers *_resultat.csv pour repartir à zéro
dossiers.forEach(fichier => {
    if ((fichier.isFile()) && (fichier.name.endsWith(`_resultat.csv`))) {
        fs.rmSync(`${dossierRacine}\\${fichier.name}`);
    };
    if (fichier.isDirectory()) {
        // Je compte les dossiers pour la barre de progression 
        nbDossiers++;
    };
})
// Démarrage progressBarDossiers
//progressBarDossiers.start(nbDossiers, 0);
dossiers.forEach(dossier => {
    // Je parcours tout le dossier racine à la recherche des dossiers
    if (dossier.isDirectory()) {
        console.log(`\n\nTraitement du dossier : ${dossier.name}`);
        let fichiers = fs.readdirSync(`${dossierRacine}\\${dossier.name}`);
        const nbFichiers = fichiers.length;
        // Démarrage progressBarFichiers
        progressBarFichiers.start(nbFichiers, 0);
        fichiers.forEach(fichier => {
            // Je traite chaque fichier du dossier
            //console.log(`Traitement du fichier : ${fichier}`); 
            let resulTab:string[]=[];  
            let testResult:string=calcSecondes(extractTimeDL(`${dossierRacine}\\${dossier.name}\\${fichier}`));
            let ligneResultat:string='';
            const fichierResultat:string = `${dossierRacine}\\${dossier.name}_resultat.csv`;
            resulTab[0]=extractDate(fichier)[0];
            resulTab[1]=extractDate(fichier)[1];
            resulTab[2]=dossier.name;
            if (testResult == 'erreur') {
            resulTab[3]='FAIL';
            resulTab[4]='';
            }
            else
            {
            resulTab[3]='OK';
            resulTab[4]=testResult;
            }
            ligneResultat = `;${resulTab[0]};${resulTab[1]};;;${resulTab[2]};;;;;;${resulTab[3]};;${resulTab[4]}`;
            //console.log(`La ligne résultat à écrire est : ${ligneResultat}`);
            fs.appendFileSync(fichierResultat, ligneResultat+os.EOL); 
            progressBarFichiers.increment(1);
        })
        progressBarFichiers.stop();
    }
})
console.log(`\n\nTraitement terminé.`);

//Code commenté pour tests
// let fichierTest:string = `E:\\TESTSBPOVH\\TESTLINUXRBXVR\\DL_202202051140.log`;
// let extractTimeDLResult:string = extractTimeDL(fichierTest);
// let calcSecondesResult:string = calcSecondes(extractTimeDLResult);
// console.log(`Retour de la fonction extractTimeDL : ${extractTimeDLResult}`);
// console.log(`Retour de la fonction calcSecondes : ${calcSecondesResult}`);

