import Link from 'next/link';
import styles from '../styles/Menu.module.css';

function Menu() {
  return (
    <div className={styles.header}>
      <span className={styles.logo}>Systematic review facilitation tool</span>
      <div className={styles.linkContainer}>
        <Link href="/"><span className={styles.link}>Home</span></Link>
        <Link href="/Authors"><span className={styles.link}>Authors</span></Link>
        <Link href="/Article"><span className={styles.link}>Articles</span></Link>
        <Link href="/Database"><span className={styles.link}>Database</span></Link>
        <Link href="/Graph"><span className={styles.link}>Graph</span></Link>
      </div>
    </div>
  );
}

export default Menu;
