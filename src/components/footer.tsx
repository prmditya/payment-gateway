export default function Footer() {
  const footer = [
    [
      {
        title: "Services",
        links: ["Branding", "Design", "Marketing", "Advertisement"],
      },
    ],
    [
      {
        title: "Company",
        links: ["About us", "Contact", "Jobs", "Press kit"],
      },
    ],
    [
      {
        title: "Legal",
        links: ["Terms of use", "Privacy policy", "Cookie policy"],
      },
    ],
  ];

  return (
    <footer className="footer sm:footer-horizontal bg-foreground text-background p-10 flex justify-around">
      {footer.map((section, idx) => (
        <div key={idx}>
          {section.map((item, itemIdx) => (
            <nav key={item.title} className="flex flex-col ">
              <h6 className="footer-title mb-2 font-bold uppercase text-gray-400">
                {item.title}
              </h6>
              {item.links.map((link) => (
                <a key={link} className="link link-hover">
                  {link}
                </a>
              ))}
            </nav>
          ))}
        </div>
      ))}
    </footer>
  );
}
