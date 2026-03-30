export class UIController {
  constructor() {
    this.elements = {
      circulatory: document.getElementById('toggle-circulatory'),
      respiratory: document.getElementById('toggle-respiratory'),
      nervous: document.getElementById('toggle-nervous'),
      heartRate: document.getElementById('heart-rate'),
      breathRate: document.getElementById('breath-rate'),
      heartRateLabel: document.getElementById('heart-rate-value'),
      breathRateLabel: document.getElementById('breath-rate-value'),
      name: document.getElementById('organ-name'),
      functionText: document.getElementById('organ-function'),
      description: document.getElementById('organ-description'),
    };

    this.state = {
      layers: { circulatory: true, respiratory: true, nervous: true },
      heartRate: Number(this.elements.heartRate.value),
      breathRate: Number(this.elements.breathRate.value),
    };

    this.bind();
  }

  bind() {
    this.elements.circulatory.addEventListener('change', (e) => {
      this.state.layers.circulatory = e.target.checked;
    });
    this.elements.respiratory.addEventListener('change', (e) => {
      this.state.layers.respiratory = e.target.checked;
    });
    this.elements.nervous.addEventListener('change', (e) => {
      this.state.layers.nervous = e.target.checked;
    });

    this.elements.heartRate.addEventListener('input', (e) => {
      this.state.heartRate = Number(e.target.value);
      this.elements.heartRateLabel.textContent = e.target.value;
    });

    this.elements.breathRate.addEventListener('input', (e) => {
      this.state.breathRate = Number(e.target.value);
      this.elements.breathRateLabel.textContent = e.target.value;
    });
  }

  updateInfo(organ) {
    if (!organ) {
      this.elements.name.textContent = 'Select an organ';
      this.elements.functionText.textContent = 'Function details will appear here.';
      this.elements.description.textContent = '';
      return;
    }
    this.elements.name.textContent = organ.name;
    this.elements.functionText.textContent = organ.functionText;
    this.elements.description.textContent = organ.description;
  }
}
