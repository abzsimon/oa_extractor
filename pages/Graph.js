import Link from "next/link";

function GraphPage() {
  return (
    <div className="flex flex-col justify-center ml-40 h-64">
      <h1>Le graph bibliograph arrive bientôt</h1>
      <Link
        href="https://www.inshs.cnrs.fr/fr/cnrsinfo/bibliograph-un-outil-et-une-methode-pour-visualiser-les-paysages-scientometriques"
        legacyBehavior
      >
        <a className="text-blue-600 hover:underline">
          Page CNRS de bibliograph
        </a>
      </Link>
      <h1>
        Exemple de lien Bibliograph donné par Paul :
        https://bibliograph.it/#?csvFile=http://localhost/api/v1/datasets/pathos/publications.csv?openAlexDomains%257Cvalues=Social+Sciences&openAlexFields%257Cvalues=Arts+and+Humanities&size=200
      </h1>
    </div>
  );
}

export default GraphPage;
