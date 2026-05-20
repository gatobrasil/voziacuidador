# Vozia Cuidador - Versão Final MVP

Alterações incluídas:

1. Cadastro único da família responsável
   - Removida escolha livre entre Familiar, Cuidador e Paciente no cadastro.
   - A conta criada passa a ser a conta responsável pelo paciente.

2. Segurança básica de alteração
   - Removido botão que permitia qualquer usuário virar familiar administrador.
   - Toda ação importante pede confirmação antes de salvar.

3. Foto do paciente
   - Cadastro de paciente com upload de foto.
   - Foto aparece na tela do paciente.

4. Histórico útil para o médico
   - Nova aba: Anamnese.
   - Mostra identificação, diagnóstico, doenças de base, alergias, medicações, sinais vitais, eventos recentes, rotina e confirmações de medicação.
   - Botão para imprimir o resumo para consulta.

5. Medicação e alertas
   - Cadastro de medicação com nome, dose, horário, frequência, duração e observações.
   - Horário vira alerta visual ativo para o cuidador.
   - Cuidador confirma: administrado, adiado ou não administrado.

6. Rotina, eventos e comunicação
   - Rotinas com confirmação.
   - Eventos clínicos com timeline.
   - Comunicação rápida com fala em português e registro no histórico.

7. Relatório
   - Relatório diário imprimível.

Como usar:

1. Suba este projeto no Lovable.
2. Conecte com Supabase.
3. Rode as migrations do diretório supabase/migrations.
4. Configure Auth no Supabase.
5. Configure o bucket patient-photos, já previsto nas migrations.
6. Faça deploy pelo Lovable.

Observação:
Este MVP não substitui avaliação médica. Ele organiza histórico, rotina e registros para apoiar familiar, cuidador e profissional de saúde.
