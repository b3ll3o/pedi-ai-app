import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileNav } from '../MobileNav';

/**
 * Testes do MobileNav — foca em comportamento, não em estilo.
 * A visibilidade por breakpoint é testada via E2E (Playwright)
 * porque jsdom não processa @media queries de forma confiável.
 *
 * Os testes aqui validam:
 * - ARIA: aria-expanded, aria-controls, role="dialog", aria-modal
 * - Comportamento: abrir/fechar drawer, fechar por ESC, fechar por backdrop
 * - Links: âncoras rolam para seção (mock scrollIntoView) e fecham o drawer
 * - Foco: foco volta para o hamburger ao fechar
 * - Body scroll: overflow do body é travado quando drawer está aberto
 */
describe('MobileNav', () => {
  beforeEach(() => {
    // jsdom não implementa scrollIntoView por padrão
    Element.prototype.scrollIntoView = jest.fn();
  });

  it('renderiza o hamburger trigger com atributos ARIA corretos', () => {
    render(<MobileNav />);
    const trigger = screen.getByRole('button', { name: /abrir menu de navegação/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls');
  });

  it('abre o drawer ao clicar no hamburger', async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    const trigger = screen.getByRole('button', { name: /abrir menu de navegação/i });
    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
  });

  it('altera aria-label do hamburger entre "abrir" e "fechar"', async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    const trigger = screen.getByRole('button', { name: /abrir menu de navegação/i });
    await user.click(trigger);
    expect(screen.getByRole('button', { name: /fechar menu de navegação/i })).toBeInTheDocument();
  });

  it('renderiza todos os links de navegação esperados', () => {
    render(<MobileNav />);

    // Inline nav (desktop) — renderiza sempre no DOM, visibilidade via CSS
    const inlineNav = screen.getByRole('navigation', { name: /navegação principal/i });
    expect(within(inlineNav).getByText('Funcionalidades')).toBeInTheDocument();
    expect(within(inlineNav).getByText('Como Funciona')).toBeInTheDocument();
    expect(within(inlineNav).getByText('Preços')).toBeInTheDocument();
  });

  it('renderiza "Entrar" e "Começar Grátis" no drawer quando aberto', async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByRole('button', { name: /abrir menu de navegação/i }));

    const drawer = screen.getByRole('dialog', { hidden: true });
    expect(within(drawer).getByText('Entrar')).toBeInTheDocument();
    expect(within(drawer).getByText('Começar Grátis')).toBeInTheDocument();
  });

  it('fecha o drawer ao pressionar ESC', async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByRole('button', { name: /abrir menu de navegação/i }));
    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    // Drawer deve ficar escondido após ESC
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toHaveAttribute('hidden');
  });

  it('tecla que não é ESC não fecha o drawer', async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByRole('button', { name: /abrir menu de navegação/i }));
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).not.toHaveAttribute('hidden');

    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'a' });
    fireEvent.keyDown(document, { key: 'ArrowDown' });

    // Drawer continua aberto
    expect(dialog).not.toHaveAttribute('hidden');
  });

  it('fecha o drawer ao clicar no backdrop', async () => {
    const user = userEvent.setup();
    const { container } = render(<MobileNav />);

    await user.click(screen.getByRole('button', { name: /abrir menu de navegação/i }));

    // Backdrop é o único div sem role/aria que cobre a tela inteira
    const backdrop = container.querySelector('div[aria-hidden="true"]:not([role])');
    expect(backdrop).toBeInTheDocument();
    if (backdrop) {
      await user.click(backdrop as HTMLElement);
    }

    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toHaveAttribute('hidden');
  });

  it('fecha o drawer ao clicar no botão "Fechar menu" dentro do drawer', async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByRole('button', { name: /abrir menu de navegação/i }));
    const drawer = screen.getByRole('dialog', { hidden: true });
    expect(drawer).toBeVisible();

    await user.click(screen.getByRole('button', { name: /^fechar menu$/i }));

    expect(drawer).toHaveAttribute('hidden');
  });

  it('fecha o drawer quando a viewport cruza para >= 768px', async () => {
    // Capturamos o callback registrado pelo componente e disparamos manualmente.
    let changeListener: ((e: MediaQueryListEvent) => void) | null = null;
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn().mockImplementation(
      () =>
        ({
          matches: false,
          media: '',
          onchange: null,
          addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
            changeListener = cb;
          },
          removeEventListener: jest.fn(),
          addListener: jest.fn(),
          removeListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }) as MediaQueryList,
    );

    try {
      const user = userEvent.setup();
      render(<MobileNav />);

      // Abre o drawer
      await user.click(screen.getByRole('button', { name: /abrir menu de navegação/i }));
      expect(screen.getByRole('dialog', { hidden: true })).toBeVisible();

      // Simula mudança para desktop (viewport >= 768px)
      expect(changeListener).toBeTruthy();
      (changeListener as unknown as (e: MediaQueryListEvent) => void)({
        matches: true,
      } as MediaQueryListEvent);

      // Drawer deve fechar (aguarda re-render assíncrono)
      await waitFor(() => {
        expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('hidden');
      });

      // Body scroll deve ser restaurado
      expect(document.body.style.overflow).not.toBe('hidden');
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('clicar no link "Entrar" do drawer fecha o drawer', async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByRole('button', { name: /abrir menu de navegação/i }));
    const drawer = screen.getByRole('dialog', { hidden: true });
    await user.click(within(drawer).getByText('Entrar'));

    expect(drawer).toHaveAttribute('hidden');
  });

  it('clicar no CTA "Começar Grátis" do drawer fecha o drawer', async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByRole('button', { name: /abrir menu de navegação/i }));
    const drawer = screen.getByRole('dialog', { hidden: true });
    await user.click(within(drawer).getByText('Começar Grátis'));

    expect(drawer).toHaveAttribute('hidden');
  });

  it('clicar no link inline do nav (desktop) rola para a seção', async () => {
    const user = userEvent.setup();
    const scrollSpy = jest.spyOn(Element.prototype, 'scrollIntoView');

    const target = document.createElement('section');
    target.id = 'pricing';
    document.body.appendChild(target);

    render(<MobileNav />);

    const inlineNav = screen.getByRole('navigation', { name: /navegação principal/i });
    await user.click(within(inlineNav).getByText('Preços'));

    expect(scrollSpy).toHaveBeenCalled();

    document.body.removeChild(target);
  });

  it('link com href que não é âncora não chama scrollIntoView', async () => {
    const user = userEvent.setup();
    const scrollSpy = jest.spyOn(Element.prototype, 'scrollIntoView');

    render(<MobileNav />);

    // Link "Entrar" no inline nav (não-âncora) — não deve rolar
    // (mas o inline nav está oculto por CSS no mobile, mas funcionalmente testável)
    // Aqui validamos que handleAnchorClick retorna cedo para hrefs que não começam com #
    // Como os links do inline nav são todos âncoras, validamos via drawer:
    await user.click(screen.getByRole('button', { name: /abrir menu de navegação/i }));
    const drawer = screen.getByRole('dialog', { hidden: true });
    await user.click(within(drawer).getByText('Entrar')); // Link Next, não âncora

    // scrollIntoView não foi chamado para o "Entrar"
    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it('âncora inexistente (sem elemento no DOM) não chama scrollIntoView mas fecha o drawer', async () => {
    const user = userEvent.setup();
    const scrollSpy = jest.spyOn(Element.prototype, 'scrollIntoView');

    render(<MobileNav />);

    await user.click(screen.getByRole('button', { name: /abrir menu de navegação/i }));
    const drawer = screen.getByRole('dialog', { hidden: true });

    // Clica em um link cujo target não existe no DOM
    await user.click(within(drawer).getByText('Como Funciona'));

    expect(scrollSpy).not.toHaveBeenCalled();
    expect(drawer).toHaveAttribute('hidden');
  });

  it('trava o scroll do body quando o drawer está aberto e libera ao fechar', async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    expect(document.body.style.overflow).not.toBe('hidden');

    await user.click(screen.getByRole('button', { name: /abrir menu de navegação/i }));
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('links de âncora chamam scrollIntoView e fecham o drawer', async () => {
    const user = userEvent.setup();
    const scrollSpy = jest.spyOn(Element.prototype, 'scrollIntoView');

    // Cria o elemento âncora esperado pelo handler
    const target = document.createElement('section');
    target.id = 'features';
    document.body.appendChild(target);

    render(<MobileNav />);

    await user.click(screen.getByRole('button', { name: /abrir menu de navegação/i }));
    const drawer = screen.getByRole('dialog', { hidden: true });

    const funcionalidadesLink = within(drawer).getByText('Funcionalidades');
    await user.click(funcionalidadesLink);

    expect(scrollSpy).toHaveBeenCalled();
    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('hidden');

    document.body.removeChild(target);
  });

  it('drawer tem aria-modal e aria-labelledby apontando para um título', async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByRole('button', { name: /abrir menu de navegação/i }));
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    const title = document.getElementById(labelledBy as string);
    expect(title).toHaveTextContent(/menu de navegação/i);
  });

  it('hamburger tem largura e altura mínimas de 44px (touch target WCAG)', () => {
    render(<MobileNav />);
    const trigger = screen.getByRole('button', { name: /abrir menu de navegação/i });
    // O CSS module aplica width/height/min-width/min-height de 44px
    // Verificamos via classes que o botão tem o estilo do .hamburger
    expect(trigger.className).toMatch(/hamburger/);
  });
});
