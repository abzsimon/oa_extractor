import styles from '../styles/Home.module.css';

// pour le moment component vide, à réfléchir ce que je mets sur la landing page
function Home() {
 return (
   <div>
     <main className={styles.main}>
       <h1 className={styles.title}>
         Welcome to <a href="https://nextjs.org">Next.js!</a>
       </h1>
     </main>
   </div>
 );
}

export default Home;