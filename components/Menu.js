import Link from 'next/link';
import styles from '../styles/Menu.module.css';

function Menu() {
  return (
    <div className={styles.header}>
      <span className={styles.logo}>Systematic review facilitation tool</span>
      <div className={styles.linkContainer}>
        <Link href="/"><span className={styles.link}>Home</span></Link>
        <Link href="/Authors"><span className={styles.link}>Authors</span></Link>
        <Link className={styles.link} href="/Article"><span className={styles.link}>Articles</span></Link>
      </div>
    </div>
  );
}

export default Menu;
